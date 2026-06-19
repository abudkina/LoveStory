import { User } from "@/types";

const USERS_KEY = "love_story_users";
const SESSION_KEY = "love_story_session";

function getUsers(): Record<string, User & { password: string }> {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : {};
}

function saveUsers(users: Record<string, User & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register(
  email: string,
  password: string,
  name: string
): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users[normalizedEmail]) {
    return { success: false, error: "Пользователь с таким email уже существует" };
  }

  if (password.length < 6) {
    return { success: false, error: "Пароль должен быть не менее 6 символов" };
  }

  if (!name.trim()) {
    return { success: false, error: "Укажите имя" };
  }

  const user: User = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: name.trim(),
  };

  users[normalizedEmail] = { ...user, password };
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

  return { success: true, user };
}

export function login(
  email: string,
  password: string
): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const stored = users[normalizedEmail];

  if (!stored || stored.password !== password) {
    return { success: false, error: "Неверный email или пароль" };
  }

  const user: User = {
    id: stored.id,
    email: stored.email,
    name: stored.name,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}
