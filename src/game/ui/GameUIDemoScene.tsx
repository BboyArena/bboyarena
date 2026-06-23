import { useRef } from 'react';
import GameButton from './GameButton';
import GameFullscreenReticle from './GameFullscreenReticle';
import GameFullscreenToggle from './GameFullscreenToggle';
import GamePanel from './GamePanel';
import '../game.css';

const menuItems = ['Story mode', 'Training', 'Crew select', 'Settings'];
const statItems = [
  { label: 'Style', value: 'A+', meter: '84%' },
  { label: 'Stamina', value: '76', meter: '76%' },
  { label: 'Crowd', value: 'Hot', meter: '68%' }
];
const loadoutItems = [
  { label: 'Toprock', value: 'Cross step', status: 'Ready' },
  { label: 'Footwork', value: 'Six step', status: 'Queued' },
  { label: 'Freeze', value: 'Baby freeze', status: 'Locked' }
];

export default function GameUIDemoScene() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <div id="bboyarena-game-root" className="bboy-game-root" ref={rootRef}>
      <div className="game-shell">
        <div className="game-stage" data-scene="uiDemo">
          <button type="button" className="game-status-pill game-status-pill--interactive">
            UI demo scene / HUD atlas
          </button>

          <div className="game-ui-demo">
            <section className="game-ui-demo__left" aria-label="Primary menu demo">
              <div className="game-mainmenu__brand">
                <img src="/logo-bboyarena.svg" alt="BboyArena" className="game-mainmenu__logo-image" />
                <div className="game-mainmenu__subtitle">AAA style pass / 2D HUD kit</div>
              </div>

              <nav className="game-mainmenu__nav game-ui-demo__menu" aria-label="Demo menu">
                {menuItems.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={`game-mode-button ${index === 0 ? 'is-primary' : ''}`}
                  >
                    <span className="game-mode-button__icon" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="game-mode-button__body">
                      <span className="game-mode-button__title">{item}</span>
                      <span className="game-mode-button__note">{index === 0 ? 'Featured flow' : 'Component state'}</span>
                    </span>
                    <span className="game-mode-button__arrow" aria-hidden="true">
                      {'>'}
                    </span>
                  </button>
                ))}
              </nav>
            </section>

            <section className="game-ui-demo__top" aria-label="Profile HUD demo">
              <GamePanel variant="soft" className="game-profile-card game-ui-demo__profile">
                <div className="game-profile-card__avatar" aria-hidden="true" />
                <div className="game-profile-card__body">
                  <div className="game-profile-card__name">BBOY_ROOKIE</div>
                  <div className="game-profile-card__meta">Level 04 / 1250 XP</div>
                </div>
              </GamePanel>

              <GamePanel variant="soft" className="game-currency-card">
                <div className="game-currency-card__coin" aria-hidden="true" />
                <div className="game-currency-card__value">865</div>
                <button type="button" className="game-currency-card__plus" aria-label="Add currency">
                  +
                </button>
              </GamePanel>
            </section>

            <section className="game-ui-demo__center" aria-label="Card demo">
              <GamePanel variant="dark" className="game-ui-demo__mission">
                <div className="game-section-shell__header">
                  <div>
                    <p className="game-panel__label">Mission card</p>
                    <div className="game-panel__title">Win the cypher</div>
                    <p className="game-panel__description">
                      A dense HUD surface for current objective, reward, status and one strong action.
                    </p>
                  </div>
                  <span className="game-section-shell__tag">Live HUD</span>
                </div>

                <div className="game-ui-demo__stat-grid">
                  {statItems.map((item) => (
                    <div key={item.label} className="game-ui-demo__stat-card">
                      <p>{item.label}</p>
                      <strong>{item.value}</strong>
                      <div className="game-meter" aria-hidden="true">
                        <span style={{ width: item.meter }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="game-ui-demo__actions">
                  <GameButton variant="primary">Start round</GameButton>
                  <GameButton variant="ghost">Inspect crew</GameButton>
                </div>
              </GamePanel>
            </section>

            <section className="game-ui-demo__right" aria-label="Secondary card demo">
              <GamePanel variant="light" className="game-ui-demo__loadout">
                <p className="game-panel__label">Move loadout</p>
                <div className="game-ui-demo__loadout-list">
                  {loadoutItems.map((item) => (
                    <div key={item.label} className="game-ui-demo__loadout-row">
                      <div>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <em>{item.status}</em>
                    </div>
                  ))}
                </div>
              </GamePanel>

              <GamePanel variant="warm" className="game-ui-demo__notice">
                <p className="game-panel__label">Notification</p>
                <div className="game-panel__title">New challenge ready</div>
                <p className="game-panel__description">Compact event card for rewards, warnings and system feedback.</p>
              </GamePanel>
            </section>

            <section className="game-ui-demo__bottom" aria-label="Button and chip demo">
              <GameButton variant="primary">Primary</GameButton>
              <GameButton variant="secondary">Secondary</GameButton>
              <GameButton variant="warm">Reward</GameButton>
              <GameButton variant="ghost">Ghost</GameButton>
              <span className="game-ui-demo__chip">Combo x4</span>
              <span className="game-ui-demo__chip game-ui-demo__chip--alert">Perfect beat</span>
            </section>
          </div>

          <GameFullscreenToggle targetRef={rootRef} />
          <GameFullscreenReticle targetRef={rootRef} />
        </div>
      </div>
    </div>
  );
}
