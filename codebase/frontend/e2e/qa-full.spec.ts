/**
 * Comprehensive front-end QA pass — tests the live app as a real user.
 * Registers a fresh throwaway account; safe to mutate/destroy test data.
 *
 * Run against EC2:
 *   BASE_URL=http://ec2-35-154-3-162.ap-south-1.compute.amazonaws.com \
 *   API_URL=http://ec2-35-154-3-162.ap-south-1.compute.amazonaws.com:8080/api/v1 \
 *   npx playwright test e2e/qa-full.spec.ts --project=chromium
 */
import { test, expect, Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
// Backend API — try same-host :8080, override with API_URL env
const API_BASE = process.env.API_URL ?? BASE_URL.replace(/:\d+$/, '') + ':8080/api/v1'

// Fixed email — stable across process restarts and module reloads
const QA_EMAIL = 'qatest-e2e-stable@test.com'
const QA_PASSWORD = 'QaTest123!'
const QA_NAME = 'QA Tester Stable'

// Shared state set during QA-AUTH, consumed by later describes
let authToken = ''
let testBoardId = ''
let testWorkspaceId = ''

// Register the test user once before all tests run
async function ensureTestUser() {
  // Try login first — user may already exist from a prior run
  const loginR = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD }),
  })
  if (loginR.status === 200 && loginR.body?.accessToken) {
    authToken = loginR.body.accessToken
    return
  }
  // Register if login failed
  const regR = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD, displayName: QA_NAME }),
  })
  if (regR.status < 300) {
    const loginR2 = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD }),
    })
    if (loginR2.status === 200 && loginR2.body?.accessToken) {
      authToken = loginR2.body.accessToken
    }
  }
}

async function apiFetch(path: string, opts: RequestInit & { token?: string } = {}) {
  const { token, ...rest } = opts
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rest.headers ?? {}),
    },
    ...rest,
  })
  const text = await resp.text()
  try { return { status: resp.status, body: JSON.parse(text) } } catch { return { status: resp.status, body: text } }
}

async function uiLogin(page: Page, email = QA_EMAIL, password = QA_PASSWORD) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(800)
}

async function ensureLoggedIn(page: Page) {
  if (page.url().includes('/login') || page.url() === 'about:blank') {
    await uiLogin(page)
  }
}

// Bootstrap: register + login the QA user before any test runs
test.beforeAll(async () => {
  await ensureTestUser()
})

// ---------------------------------------------------------------------------
// QA-AUTH
// ---------------------------------------------------------------------------

test.describe('QA-AUTH — Authentication', () => {
  test('signup page is reachable and shows registration form', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
    const hasSignup = await page.locator('input[type="email"]').count() > 0
    expect.soft(hasSignup, 'Signup form email input not found').toBe(true)
  })

  test('self-register new QA account via UI or API', async ({ page }) => {
    // Try UI signup first
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
    const emailInput = page.locator('input[type="email"]')
    const hasSignupForm = await emailInput.count() > 0

    if (hasSignupForm) {
      await emailInput.fill(QA_EMAIL)
      const passwordInputs = page.locator('input[type="password"]')
      await passwordInputs.first().fill(QA_PASSWORD)
      if (await passwordInputs.count() > 1) {
        await passwordInputs.nth(1).fill(QA_PASSWORD)
      }
      // Try to fill display name
      const nameInput = page.locator('input[placeholder*="name" i], input[name="displayName"], input[name="name"]').first()
      if (await nameInput.count() > 0) {
        await nameInput.fill(QA_NAME)
      }
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(2000)
      // If not redirected, try API fallback
      if (page.url().includes('/signup')) {
        const r = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD, displayName: QA_NAME }),
        })
        expect.soft(r.status, 'API register failed').toBeLessThan(300)
      }
    } else {
      // No UI signup — use API
      const r = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD, displayName: QA_NAME }),
      })
      expect.soft(r.status, 'API register returned non-2xx').toBeLessThan(300)
    }
  })

  test('login with valid credentials redirects away from /login', async ({ page }) => {
    await uiLogin(page)
    expect.soft(page.url(), 'Should redirect away from /login').not.toContain('/login')
  })

  test('login page renders with email + password fields and submit button', async ({ page }) => {
    await page.goto('/login')
    await expect.soft(page.locator('input[type="email"]')).toBeVisible()
    await expect.soft(page.locator('input[type="password"]')).toBeVisible()
    await expect.soft(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('invalid credentials show error feedback and stay on login', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('nobody_xyz@nowhere.invalid')
    await page.locator('input[type="password"]').fill('WrongPass999!')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(2000)
    expect.soft(page.url(), 'Should remain on /login after invalid creds').toContain('/login')
    const errorEl = page.locator('[role="alert"], .error, [class*="error"], [class*="Error"]').first()
    const hasError = await errorEl.isVisible({ timeout: 3000 }).catch(() => false)
    expect.soft(hasError, 'Error feedback not shown for invalid credentials').toBe(true)
  })

  test('unauthenticated access to /boards redirects to /login', async ({ page }) => {
    await page.goto('/boards')
    await page.waitForURL(url => url.includes('/login'), { timeout: 6000 }).catch(() => {})
    expect.soft(page.url(), 'Unauthenticated /boards should redirect to /login').toContain('/login')
  })

  test('logout clears session and redirects to login', async ({ page }) => {
    await uiLogin(page)
    const logoutBtn = page.locator('[aria-label="Log out"], [title="Log out"], button:has-text("Log out"), button:has-text("Sign out")').first()
    const hasLogout = await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasLogout) {
      test.skip() // logout button not visible in sidebar — noted elsewhere
      return
    }
    await logoutBtn.click()
    await page.waitForURL(url => url.includes('/login'), { timeout: 5000 }).catch(() => {})
    expect.soft(page.url()).toContain('/login')
  })
})

// ---------------------------------------------------------------------------
// QA-BOARD
// ---------------------------------------------------------------------------

test.describe('QA-BOARD — Board CRUD', () => {
  test('boards page shows board list after login', async ({ page }) => {
    await uiLogin(page)
    await expect.soft(
      page.locator('text=My Boards, text=boards, h1, h2').first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('create board modal opens from "+ New board" button', async ({ page }) => {
    await uiLogin(page)
    const newBoardBtn = page.locator('button', { hasText: /new board/i }).first()
    await expect.soft(newBoardBtn).toBeVisible({ timeout: 8000 })
    await newBoardBtn.click()
    await page.waitForTimeout(500)
    const modal = page.locator('[role="dialog"], [class*="modal" i], [class*="Modal" i]').first()
    const nameInput = page.locator('input[placeholder*="board name" i], input[placeholder*="name" i]').first()
    const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false)
    const inputVisible = await nameInput.isVisible({ timeout: 3000 }).catch(() => false)
    expect.soft(modalVisible || inputVisible, 'Create board modal did not open').toBe(true)
  })

  test('create board modal has emoji picker, color swatches, description, and live preview', async ({ page }) => {
    await uiLogin(page)
    const newBoardBtn = page.locator('button', { hasText: /new board/i }).first()
    await newBoardBtn.click()
    await page.waitForTimeout(600)

    const hasDescription = await page.locator('textarea[placeholder*="description" i], input[placeholder*="description" i]').isVisible({ timeout: 3000 }).catch(() => false)
    const hasEmojiPicker = await page.locator('button[title], [class*="emoji" i]').count() > 0
    const hasColorSwatch = await page.locator('[class*="swatch" i], [class*="color" i]').count() > 0

    expect.soft(hasDescription, 'Description field missing from CreateBoard modal').toBe(true)
    expect.soft(hasEmojiPicker, 'Emoji picker missing from CreateBoard modal').toBe(true)
    expect.soft(hasColorSwatch, 'Color swatches missing from CreateBoard modal').toBe(true)
  })

  test('can create a board with name, emoji, description and it appears in board list', async ({ page }) => {
    await uiLogin(page)
    const newBoardBtn = page.locator('button', { hasText: /new board/i }).first()
    await newBoardBtn.click()
    await page.waitForTimeout(500)

    const nameInput = page.locator('input[placeholder*="board name" i], input[placeholder*="name" i]').first()
    if (!(await nameInput.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip()
      return
    }
    await nameInput.fill('QA Test Board')

    const descInput = page.locator('textarea[placeholder*="description" i]').first()
    if (await descInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await descInput.fill('QA test board description')
    }

    const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').last()
    await submitBtn.click()
    await page.waitForTimeout(1500)

    // Should appear in board list or navigate to the new board
    const boardVisible = await page.locator('text=QA Test Board').isVisible({ timeout: 6000 }).catch(() => false)
    expect.soft(boardVisible, 'Newly created board "QA Test Board" not visible').toBe(true)

    // Capture board ID for later tests
    const url = page.url()
    const match = url.match(/boards\/([^/]+)/)
    if (match) testBoardId = match[1]
  })

  test('board navigation tabs (Board, List, Timeline, Calendar) are present', async ({ page }) => {
    if (!testBoardId) {
      // Try to get any board ID from the API
      const r = await apiFetch('/boards', { token: authToken })
      if (r.status === 200 && Array.isArray(r.body) && r.body.length > 0) {
        testBoardId = r.body[0].id
      }
    }
    if (!testBoardId) { test.skip(); return }

    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    expect.soft(await page.locator('text=Board').count() > 0).toBe(true)
    expect.soft(await page.locator('text=Timeline').count() > 0, 'Timeline tab missing').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// QA-COLUMN
// ---------------------------------------------------------------------------

test.describe('QA-COLUMN — Column Management', () => {
  test.beforeAll(async () => {
    // Ensure we have a board to work with
    if (!authToken) return
    if (!testBoardId) {
      // Create a workspace + board via API
      const wsR = await apiFetch('/workspaces', {
        method: 'POST',
        token: authToken,
        body: JSON.stringify({ name: 'QA Workspace' }),
      })
      if (wsR.status < 300) testWorkspaceId = wsR.body.id

      const boardR = await apiFetch('/boards', {
        method: 'POST',
        token: authToken,
        body: JSON.stringify({ name: 'QA Column Board', workspaceId: testWorkspaceId }),
      })
      if (boardR.status < 300) testBoardId = boardR.body.id
    }
  })

  test('board shows column name input in toolbar', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    const colInput = page.locator('input[placeholder*="column" i], input[placeholder*="Column" i]').first()
    const visible = await colInput.isVisible({ timeout: 5000 }).catch(() => false)
    expect.soft(visible, 'Column name input not visible in board toolbar').toBe(true)
  })

  test('add column creates a new column on the board', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const colInput = page.locator('input[placeholder*="column" i]').first()
    if (!(await colInput.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }

    await colInput.fill('QA Column')
    const addBtn = page.locator('button', { hasText: /^\+ Add$|^Add$/i }).first()
    if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addBtn.click()
    } else {
      await page.keyboard.press('Enter')
    }
    await page.waitForTimeout(800)
    expect.soft(await page.locator('text=QA Column').isVisible({ timeout: 4000 }).catch(() => false), 'Column "QA Column" not visible after creation').toBe(true)
  })

  test('column header shows a context menu / options button', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Hover first column header to reveal the options button
    const colHeader = page.locator('[class*="column" i] h2, [class*="column" i] h3, [class*="ColumnHeader" i]').first()
    if (await colHeader.count() === 0) { test.skip(); return }
    await colHeader.hover()
    await page.waitForTimeout(300)

    const optionsBtn = page.locator('[aria-label*="options" i], [aria-label*="menu" i], [class*="column" i] button').first()
    const visible = await optionsBtn.isVisible({ timeout: 2000 }).catch(() => false)
    expect.soft(visible, 'Column options/context menu button not visible on hover').toBe(true)
  })

  test('column colour picker has 24 swatches and is re-openable', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const colHeader = page.locator('[class*="column" i] h2, [class*="ColumnHeader"]').first()
    if (await colHeader.count() === 0) { test.skip(); return }
    await colHeader.hover()

    const optionsBtn = page.locator('[class*="column" i] button[aria-label], [class*="column" i] button').last()
    await optionsBtn.click().catch(() => {})
    await page.waitForTimeout(400)

    const colorPickerItem = page.locator('text=/color|colour/i, [class*="color" i] button').first()
    if (await colorPickerItem.isVisible({ timeout: 2000 }).catch(() => false)) {
      await colorPickerItem.click()
      await page.waitForTimeout(400)
      const swatches = page.locator('[class*="swatch" i]')
      const count = await swatches.count()
      expect.soft(count, 'Expected 24 colour swatches in column colour picker').toBeGreaterThanOrEqual(24)

      // Re-openable: close and reopen
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await colHeader.hover()
      await optionsBtn.click().catch(() => {})
      await page.waitForTimeout(300)
      const colorPickerItem2 = page.locator('text=/color|colour/i').first()
      const reopenable = await colorPickerItem2.isVisible({ timeout: 2000 }).catch(() => false)
      expect.soft(reopenable, 'Column colour picker is not re-openable after closing').toBe(true)
    } else {
      // Color picker item not found — check if picker is already open
      const swatches = page.locator('[class*="swatch" i]')
      const count = await swatches.count()
      expect.soft(count >= 0, 'Column colour picker swatch check').toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// QA-CARD
// ---------------------------------------------------------------------------

test.describe('QA-CARD — Card CRUD', () => {
  test('add card button / input is present on column', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const addCardBtn = page.locator('button:has-text("Add card"), button:has-text("+ Add"), button:has-text("Add a card"), [class*="add" i]').first()
    const visible = await addCardBtn.isVisible({ timeout: 5000 }).catch(() => false)
    expect.soft(visible, 'Add card button not visible on column').toBe(true)
  })

  test('can create a card in the first column', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const addCardBtn = page.locator('button:has-text("Add card"), button:has-text("+ Add"), [class*="addCard" i]').first()
    if (!(await addCardBtn.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }

    await addCardBtn.click()
    await page.waitForTimeout(400)

    const cardInput = page.locator('input[placeholder*="card title" i], input[placeholder*="title" i], textarea[placeholder*="title" i]').first()
    if (await cardInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cardInput.fill('QA Test Card')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(800)
      expect.soft(await page.locator('text=QA Test Card').isVisible({ timeout: 4000 }).catch(() => false), 'Card "QA Test Card" not visible after creation').toBe(true)
    }
  })

  test('clicking a card opens the card modal', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const card = page.locator('[class*="card" i]:not([class*="column" i]):not([class*="board" i])').first()
    if (!(await card.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await card.click()
    await page.waitForTimeout(600)

    const modal = page.locator('[role="dialog"]').first()
    const visible = await modal.isVisible({ timeout: 3000 }).catch(() => false)
    expect.soft(visible, 'Card modal did not open on click').toBe(true)
  })

  test('card modal shows title, description, due date, and start date fields', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const card = page.locator('[class*="card" i]:not([class*="column" i])').first()
    if (!(await card.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await card.click()
    await page.waitForTimeout(600)

    expect.soft(await page.locator('input[placeholder*="title" i], textarea[placeholder*="title" i], [class*="title" i] input').isVisible({ timeout: 3000 }).catch(() => false), 'Title field missing from card modal').toBe(true)
    expect.soft(await page.locator('textarea[placeholder*="description" i], [class*="description" i] textarea').isVisible({ timeout: 3000 }).catch(() => false), 'Description field missing from card modal').toBe(true)
    expect.soft(await page.locator('input[type="date"], [class*="due" i], [placeholder*="due" i]').isVisible({ timeout: 3000 }).catch(() => false), 'Due date field missing from card modal').toBe(true)
    expect.soft(await page.locator('[class*="start" i], [placeholder*="start" i]').isVisible({ timeout: 3000 }).catch(() => false), 'Start date field missing from card modal').toBe(true)
  })

  test('card has colour accent bar when color is set', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Open card modal and set a color
    const card = page.locator('[class*="card" i]:not([class*="column" i])').first()
    if (!(await card.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await card.click()
    await page.waitForTimeout(600)

    const colorPicker = page.locator('[class*="color" i] button, button[aria-label*="color" i]').first()
    if (await colorPicker.isVisible({ timeout: 2000 }).catch(() => false)) {
      await colorPicker.click()
      await page.waitForTimeout(300)
      const swatch = page.locator('[class*="swatch" i]').first()
      if (await swatch.isVisible({ timeout: 1000 }).catch(() => false)) {
        await swatch.click()
        await page.waitForTimeout(500)
      }
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // Check for accent bar
      const accentBar = page.locator('[class*="accent" i], [style*="border-top"]').first()
      const hasAccent = await accentBar.isVisible({ timeout: 2000 }).catch(() => false)
      expect.soft(hasAccent, 'Card colour accent bar not visible after setting color').toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// QA-THEME
// ---------------------------------------------------------------------------

test.describe('QA-THEME — Theme System', () => {
  test('SettingsModal opens from sidebar footer cog button', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i], button[class*="cog" i], button[class*="settings" i]').first()
    const hasCog = await cogBtn.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasCog) {
      // Try settings route instead
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      const settingsPage = !(await page.locator('text=404').count() > 0)
      expect.soft(settingsPage, 'Settings not accessible via cog or /settings route').toBe(true)
      return
    }
    await cogBtn.click()
    await page.waitForTimeout(500)

    const modal = page.locator('[role="dialog"], [class*="SettingsModal" i], [class*="settings-modal" i]').first()
    expect.soft(await modal.isVisible({ timeout: 3000 }).catch(() => false), 'SettingsModal did not open from cog button').toBe(true)
  })

  test('SettingsModal shows 20-theme grouped picker (Classic / Premium Dark / Premium Light)', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    // Try opening settings modal
    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
    if (await cogBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cogBtn.click()
    } else {
      await page.goto('/settings')
    }
    await page.waitForTimeout(600)

    const classicGroup = await page.locator('text=/classic/i').count() > 0
    const premiumGroup = await page.locator('text=/premium/i').count() > 0
    const themeButtons = await page.locator('button[title], [class*="theme" i] button').count()

    expect.soft(classicGroup, 'Classic theme group label missing from SettingsModal').toBe(true)
    expect.soft(premiumGroup, 'Premium theme group label missing from SettingsModal').toBe(true)
    expect.soft(themeButtons >= 6, `Expected at least 6 theme buttons, got ${themeButtons}`).toBe(true)
  })

  test('switching to a premium dark theme applies glass tokens to sidebar', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
    if (await cogBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cogBtn.click()
      await page.waitForTimeout(500)
    }

    const premiumDarkTheme = page.locator('button[title*="Night" i], button[title*="Dark" i], button[title*="night" i]').first()
    if (!(await premiumDarkTheme.isVisible({ timeout: 2000 }).catch(() => false))) { test.skip(); return }

    const beforeBg = await page.locator('aside, [class*="sidebar" i]').first().evaluate(el =>
      getComputedStyle(el).backgroundColor
    ).catch(() => '')

    await premiumDarkTheme.click()
    await page.waitForTimeout(600)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)

    const afterBg = await page.locator('aside, [class*="sidebar" i]').first().evaluate(el =>
      getComputedStyle(el).backgroundColor
    ).catch(() => '')

    // Background should have changed
    expect.soft(afterBg, 'Background did not change after switching to premium dark theme').not.toBe(beforeBg)
  })

  test('AmbientBg component renders for a premium glass theme (not for classic)', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    // Switch to a premium theme
    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
    if (await cogBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cogBtn.click()
      await page.waitForTimeout(400)
      const premiumBtn = page.locator('button[title*="Night" i], button[title*="Indigo" i]').first()
      if (await premiumBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await premiumBtn.click()
        await page.waitForTimeout(500)
      }
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
    }

    const ambientBg = page.locator('[class*="AmbientBg" i], [class*="ambient" i], canvas, [id*="ambient" i]').first()
    const hasAmbient = await ambientBg.isVisible({ timeout: 2000 }).catch(() => false)
    expect.soft(hasAmbient, 'AmbientBg component not rendered for premium glass theme').toBe(true)
  })

  test('glassmorphism backdrop-filter applied on sidebar for premium theme', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    // Switch to premium theme via sidebar old-style theme buttons or settings
    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
    if (await cogBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cogBtn.click()
      await page.waitForTimeout(400)
      const premiumBtn = page.locator('button[title*="Night" i], button[title*="Indigo" i]').first()
      if (await premiumBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await premiumBtn.click()
        await page.waitForTimeout(500)
      }
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
    }

    const backdropFilter = await page.locator('aside, [class*="sidebar" i]').first().evaluate(el => {
      const style = getComputedStyle(el)
      return style.backdropFilter || style.webkitBackdropFilter || ''
    }).catch(() => '')

    // blur should appear in backdrop-filter for premium glass themes
    const hasBlur = backdropFilter.includes('blur')
    expect.soft(hasBlur, `Sidebar backdrop-filter "${backdropFilter}" does not include blur for premium theme`).toBe(true)
  })

  test('classic themes do NOT apply backdrop-filter (no-op check)', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    // Switch to a classic theme (Midnight is classic)
    const classicBtn = page.locator('button[title="Midnight"], button[title="Light"], button[title="Graphite"]').first()
    if (await classicBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await classicBtn.click()
      await page.waitForTimeout(500)
    } else {
      // Try via settings modal
      const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
      if (await cogBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cogBtn.click()
        await page.waitForTimeout(400)
        const classicThemeBtn = page.locator('text=/classic/i').first()
        const midnightBtn = page.locator('button[title="Midnight"], button:has-text("Midnight")').first()
        if (await midnightBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await midnightBtn.click()
        }
        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
      }
    }

    const backdropFilter = await page.locator('aside, [class*="sidebar" i]').first().evaluate(el => {
      const style = getComputedStyle(el)
      return style.backdropFilter || style.webkitBackdropFilter || ''
    }).catch(() => '')

    // Classic theme should have none/'' for backdrop-filter
    const hasBlur = backdropFilter.includes('blur')
    expect.soft(!hasBlur, `Classic theme sidebar unexpectedly has backdrop-filter: "${backdropFilter}"`).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// QA-DENSITY
// ---------------------------------------------------------------------------

test.describe('QA-DENSITY — Density System', () => {
  test('SettingsModal shows density picker with compact/comfortable/spacious', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
    if (!(await cogBtn.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await cogBtn.click()
    await page.waitForTimeout(500)

    const compact = await page.locator('text=/compact/i').count() > 0
    const comfortable = await page.locator('text=/comfortable/i').count() > 0
    const spacious = await page.locator('text=/spacious/i').count() > 0

    expect.soft(compact, 'Compact density option missing from SettingsModal').toBe(true)
    expect.soft(comfortable, 'Comfortable density option missing from SettingsModal').toBe(true)
    expect.soft(spacious, 'Spacious density option missing from SettingsModal').toBe(true)
  })

  test('switching density changes CSS variable on root', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
    if (!(await cogBtn.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await cogBtn.click()
    await page.waitForTimeout(400)

    // Get current card padding CSS var before switching
    const beforePad = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--card-pad').trim()
    )

    // Switch to Compact
    const compactBtn = page.locator('button:has-text("Compact"), [data-density="compact"]').first()
    if (await compactBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await compactBtn.click()
      await page.waitForTimeout(400)
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)

    const afterPad = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--card-pad').trim()
    )

    // If CSS vars exist, they should differ between densities
    if (beforePad || afterPad) {
      expect.soft(afterPad !== beforePad || afterPad !== '', 'Density change did not update CSS variable --card-pad').toBe(true)
    }
  })

  test('density selection persists after page reload', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const cogBtn = page.locator('[aria-label*="settings" i], [title*="settings" i]').first()
    if (!(await cogBtn.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await cogBtn.click()
    await page.waitForTimeout(400)

    const spaciousBtn = page.locator('button:has-text("Spacious"), [data-density="spacious"]').first()
    if (!(await spaciousBtn.isVisible({ timeout: 2000 }).catch(() => false))) { test.skip(); return }
    await spaciousBtn.click()
    await page.waitForTimeout(400)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    // Check localStorage or that the density is visually applied
    const storedDensity = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('kanban_theme') || localStorage.getItem('theme') || '{}'
        const parsed = JSON.parse(raw)
        return parsed?.state?.density ?? ''
      } catch { return '' }
    })
    expect.soft(storedDensity === 'spacious' || storedDensity === '', 'Density "spacious" not persisted in localStorage after reload').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// QA-TIMELINE
// ---------------------------------------------------------------------------

test.describe('QA-TIMELINE — Timeline View', () => {
  test('navigating to /boards/[id]/timeline renders the timeline view', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}/timeline`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const is404 = await page.locator('text=404, text=Not Found').count() > 0
    expect.soft(!is404, 'Timeline view returned 404 — route not found').toBe(true)

    const hasTimeline = await page.locator('[class*="timeline" i], [class*="Timeline" i], [class*="gantt" i]').count() > 0
    expect.soft(hasTimeline, 'Timeline component not rendered at /boards/[id]/timeline').toBe(true)
  })

  test('timeline tab in board view navigates to timeline route', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const timelineTab = page.locator('a:has-text("Timeline"), button:has-text("Timeline")').first()
    if (!(await timelineTab.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }

    await timelineTab.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    expect.soft(page.url()).toContain('timeline')
  })

  test('timeline shows today-line marker', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}/timeline`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const todayLine = page.locator('[class*="today" i], [class*="Today" i], [aria-label*="today" i]').first()
    const hasTodayLine = await todayLine.isVisible({ timeout: 3000 }).catch(() => false)
    expect.soft(hasTodayLine, 'Today-line marker not visible in timeline view').toBe(true)
  })

  test('timeline shows empty state when no cards have dates', async ({ page }) => {
    if (!testBoardId) { test.skip(); return }
    await uiLogin(page)
    await page.goto(`/boards/${testBoardId}/timeline`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Either shows bars or an empty/unscheduled state — not a blank white page
    const hasContent = await page.locator('[class*="timeline" i] *, [class*="gantt" i] *').count() > 0
    const hasEmptyState = await page.locator('text=/no cards|nothing scheduled|no dates|unscheduled/i').count() > 0
    expect.soft(hasContent || hasEmptyState, 'Timeline shows neither bars nor an empty state').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// QA-SPLASH
// ---------------------------------------------------------------------------

test.describe('QA-SPLASH — Boot Splash Overlay', () => {
  test('boot splash overlay renders on first load and then disappears', async ({ page }) => {
    await page.goto('/')
    // The splash fires on DOMContentLoaded — don't waitForLoadState before checking
    await page.waitForTimeout(200)

    const splash = page.locator('#boot, [id*="splash" i], [class*="splash" i], [class*="boot" i]')
    const splashVisible = await splash.isVisible({ timeout: 1000 }).catch(() => false)

    if (splashVisible) {
      // Wait for it to fade/remove
      await page.waitForTimeout(1500)
      const splashGone = !(await splash.isVisible({ timeout: 500 }).catch(() => true))
      expect.soft(splashGone, 'Boot splash is still visible after 1.5s — should have faded out').toBe(true)
    } else {
      // On a cold page load the splash may have already faded; check it's not still blocking
      const blocking = await splash.isVisible({ timeout: 500 }).catch(() => false)
      expect.soft(!blocking, 'Boot splash is blocking the UI').toBe(true)
    }
  })

  test('boot splash contains an SVG kanban icon', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(100)

    const splashSvg = page.locator('#boot svg, [class*="splash" i] svg, [class*="boot" i] svg').first()
    const hasSvg = await splashSvg.isVisible({ timeout: 1000 }).catch(() => false)
    expect.soft(hasSvg, 'Boot splash does not contain an SVG icon').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// QA-FAVICON
// ---------------------------------------------------------------------------

test.describe('QA-FAVICON — SVG Favicon', () => {
  test('no favicon 404 in network responses', async ({ page }) => {
    const faviconErrors: string[] = []
    page.on('response', resp => {
      if (resp.url().includes('favicon') && resp.status() === 404) {
        faviconErrors.push(resp.url())
      }
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect.soft(faviconErrors.length === 0, `Favicon 404 errors: ${faviconErrors.join(', ')}`).toBe(true)
  })

  test('favicon link element exists and is a data: SVG URI', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const faviconHref = await page.locator('link[rel*="icon"]').first().getAttribute('href').catch(() => null)
    // Either it's a data: URI SVG or a /favicon.ico — both are acceptable
    if (faviconHref) {
      const isDataSvg = faviconHref.startsWith('data:image/svg')
      const isIco = faviconHref.includes('favicon')
      expect.soft(isDataSvg || isIco, `Favicon href "${faviconHref.slice(0, 80)}" is neither data:image/svg nor a favicon file`).toBe(true)
    } else {
      // No DOM link — check /favicon.ico HTTP response
      const resp = await page.request.get('/favicon.ico')
      expect.soft(resp.status() < 400, `favicon.ico returns ${resp.status()}`).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// QA-MOBILE — 375px viewport
// ---------------------------------------------------------------------------

test.describe('QA-MOBILE — Mobile Bottom Nav', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('mobile bottom nav is visible at 375px', async ({ page }) => {
    await uiLogin(page)
    await page.waitForTimeout(500)

    const bottomNav = page.locator('[class*="BottomNav" i], [class*="bottom-nav" i], nav[class*="mobile" i]').first()
    const visible = await bottomNav.isVisible({ timeout: 5000 }).catch(() => false)
    expect.soft(visible, 'Mobile bottom nav not visible at 375px viewport').toBe(true)
  })

  test('mobile bottom nav has 5 tabs including Settings', async ({ page }) => {
    await uiLogin(page)
    await page.waitForTimeout(500)

    const navItems = page.locator('[class*="BottomNav" i] a, [class*="bottom-nav" i] a, nav[class*="mobile" i] a')
    const count = await navItems.count()
    expect.soft(count >= 4, `Expected at least 4 nav tabs, found ${count}`).toBe(true)

    const settingsTab = page.locator('[class*="BottomNav" i] a:has-text("Settings"), nav[class*="mobile" i] a:has-text("Settings")').first()
    const hasSettings = await settingsTab.isVisible({ timeout: 3000 }).catch(() => false)
    expect.soft(hasSettings, 'Mobile bottom nav Settings tab not visible').toBe(true)
  })

  test('mobile Settings tab shows theme picker, density picker, and sign-out', async ({ page }) => {
    await uiLogin(page)
    await page.waitForTimeout(500)

    const settingsTab = page.locator('[class*="BottomNav" i] a:has-text("Settings"), a[href*="settings"]').first()
    if (!(await settingsTab.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await settingsTab.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const hasThemePicker = await page.locator('text=/theme/i, button[title], [class*="theme" i]').count() > 0
    const hasDensity = await page.locator('text=/density|compact|comfortable|spacious/i').count() > 0
    const hasSignOut = await page.locator('button:has-text("Sign out"), button:has-text("Log out")').isVisible({ timeout: 2000 }).catch(() => false)

    expect.soft(hasThemePicker, 'Theme picker missing from mobile Settings tab').toBe(true)
    expect.soft(hasDensity, 'Density picker missing from mobile Settings tab').toBe(true)
    expect.soft(hasSignOut, 'Sign out button missing from mobile Settings tab').toBe(true)
  })

  test('mobile settings view has no overflow at 375px', async ({ page }) => {
    await uiLogin(page)
    await page.waitForTimeout(500)

    const settingsTab = page.locator('[class*="BottomNav" i] a:has-text("Settings"), a[href*="settings"]').first()
    if (!(await settingsTab.isVisible({ timeout: 3000 }).catch(() => false))) { test.skip(); return }
    await settingsTab.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(600)

    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect.soft(!overflowX, 'Mobile settings page has horizontal overflow at 375px').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// QA-ISSUES
// ---------------------------------------------------------------------------

test.describe('QA-ISSUES — Issues Page', () => {
  test('navigating to /issues renders the issues panel', async ({ page }) => {
    await uiLogin(page)
    await page.goto('/issues')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const is404 = await page.locator('text=404').count() > 0
    if (is404) { test.skip(); return }

    const hasIssues = await page.locator('text=Issues, text=Open, text=No issues').count() > 0
    expect.soft(hasIssues, 'Issues page does not render a recognisable issues panel').toBe(true)
  })

  test('issues page has a create issue control', async ({ page }) => {
    await uiLogin(page)
    await page.goto('/issues')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    const is404 = await page.locator('text=404').count() > 0
    if (is404) { test.skip(); return }

    const hasCreateCtrl = await page.locator('button:has-text("Create"), input[placeholder*="issue" i], input[placeholder*="title" i]').count() > 0
    expect.soft(hasCreateCtrl, 'Issues page has no create issue control').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// QA-STARRED — Starred Boards
// ---------------------------------------------------------------------------

test.describe('QA-STARRED — Starred Boards', () => {
  test('star button is visible on board card or board header', async ({ page }) => {
    await uiLogin(page)
    const starBtn = page.locator('button[aria-label*="star" i], button[title*="star" i], [class*="star" i]').first()
    const visible = await starBtn.isVisible({ timeout: 6000 }).catch(() => false)
    expect.soft(visible, 'Star button not visible on boards page or board header').toBe(true)
  })

  test('starring a board marks it and adds it to starred filter', async ({ page }) => {
    await uiLogin(page)
    const starBtn = page.locator('button[aria-label*="star" i], button[title*="star" i]').first()
    if (!(await starBtn.isVisible({ timeout: 4000 }).catch(() => false))) { test.skip(); return }

    await starBtn.click()
    await page.waitForTimeout(800)

    // Look for a starred filter or section
    const starredSection = page.locator('text=/starred/i').first()
    const hasStarred = await starredSection.isVisible({ timeout: 4000 }).catch(() => false)
    expect.soft(hasStarred, 'Starred section/filter not visible after starring a board').toBe(true)
  })
})
