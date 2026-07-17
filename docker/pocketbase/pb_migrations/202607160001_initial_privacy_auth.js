migrate((app) => {
  let users;

  try {
    users = app.findCollectionByNameOrId("users");
  } catch {
    users = new Collection({
      type: "auth",
      name: "users",
      listRule: "id = @request.auth.id",
      viewRule: "id = @request.auth.id",
      createRule: "",
      updateRule: "id = @request.auth.id",
      deleteRule: null,
      fields: [],
      passwordAuth: {
        enabled: true,
      },
    });
  }

  if (!users.fields.getByName("username")) {
    users.fields.add(new TextField({
      name: "username",
      max: 32,
      min: 3,
      presentable: true,
      required: false,
    }));
  }

  if (!users.fields.getByName("name")) {
    users.fields.add(new TextField({
      name: "name",
      max: 80,
      presentable: true,
    }));
  }

  users.addIndex("idx_users_username_unique", true, "username", "username != ''");
  app.save(users);

  const privacyDocuments = new Collection({
    type: "base",
    name: "privacy_documents",
    listRule: "active = true",
    viewRule: "active = true",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "documentType", type: "select", required: true, maxSelect: 1, values: ["privacy_policy", "terms", "newsletter"] },
      { name: "version", type: "text", required: true, max: 40 },
      { name: "title", type: "text", required: true, max: 160 },
      { name: "url", type: "url", required: true },
      { name: "effectiveAt", type: "date", required: true },
      { name: "active", type: "bool", required: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_privacy_documents_type_version ON privacy_documents (documentType, version)",
      "CREATE INDEX idx_privacy_documents_active ON privacy_documents (active)",
    ],
  });
  app.save(privacyDocuments);

  const userConsents = new Collection({
    type: "base",
    name: "user_consents",
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "user = @request.auth.id",
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "user", type: "relation", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
      { name: "documentType", type: "select", required: true, maxSelect: 1, values: ["privacy_policy", "terms", "newsletter"] },
      { name: "documentVersion", type: "text", required: true, max: 40 },
      { name: "accepted", type: "bool", required: true },
      { name: "source", type: "select", required: true, maxSelect: 1, values: ["website", "game", "api"] },
      { name: "ipAddress", type: "text", max: 120 },
      { name: "userAgent", type: "text", max: 512 },
    ],
    indexes: [
      "CREATE INDEX idx_user_consents_user ON user_consents (user)",
      "CREATE INDEX idx_user_consents_document ON user_consents (documentType, documentVersion)",
    ],
  });
  app.save(userConsents);

  const newsletterSubscriptions = new Collection({
    type: "base",
    name: "newsletter_subscriptions",
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: "user = @request.auth.id",
    updateRule: "user = @request.auth.id",
    deleteRule: null,
    fields: [
      { name: "user", type: "relation", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
      { name: "email", type: "email", required: true },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["subscribed", "unsubscribed"] },
      { name: "source", type: "select", required: true, maxSelect: 1, values: ["website", "game", "api"] },
      { name: "consentVersion", type: "text", required: true, max: 40 },
      { name: "unsubscribedAt", type: "date" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_newsletter_subscriptions_user ON newsletter_subscriptions (user)",
      "CREATE INDEX idx_newsletter_subscriptions_status ON newsletter_subscriptions (status)",
    ],
  });
  app.save(newsletterSubscriptions);
}, (app) => {
  for (const name of ["newsletter_subscriptions", "user_consents", "privacy_documents"]) {
    try {
      app.delete(app.findCollectionByNameOrId(name));
    } catch {}
  }
});
