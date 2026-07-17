migrate((app) => {
  const userConsents = app.findCollectionByNameOrId("user_consents");

  const userConsentUserField = userConsents.fields.getByName("user");
  userConsentUserField.required = false;

  if (!userConsents.fields.getByName("email")) {
    userConsents.fields.add(new EmailField({
      name: "email",
    }));
  }

  app.save(userConsents);

  const newsletterSubscriptions = app.findCollectionByNameOrId("newsletter_subscriptions");

  const newsletterUserField = newsletterSubscriptions.fields.getByName("user");
  newsletterUserField.required = false;

  newsletterSubscriptions.createRule = "";
  newsletterSubscriptions.updateRule = "";

  app.save(newsletterSubscriptions);
}, (app) => {
  const userConsents = app.findCollectionByNameOrId("user_consents");

  try {
    userConsents.fields.removeByName("email");
  } catch {}

  const userConsentUserField = userConsents.fields.getByName("user");
  userConsentUserField.required = true;
  app.save(userConsents);

  const newsletterSubscriptions = app.findCollectionByNameOrId("newsletter_subscriptions");
  const newsletterUserField = newsletterSubscriptions.fields.getByName("user");
  newsletterUserField.required = true;
  newsletterSubscriptions.createRule = "user = @request.auth.id";
  newsletterSubscriptions.updateRule = "user = @request.auth.id";
  app.save(newsletterSubscriptions);
});
