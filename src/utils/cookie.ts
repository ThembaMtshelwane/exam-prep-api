export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true, // Prevents JS from reading the cookie (XSS protection)
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: "strict" as const, // Prevents CSRF
  maxAge: 15 * 60 * 60 * 1000, //15 min
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // Prevents JS from reading the cookie (XSS protection)
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: "strict" as const, // Prevents CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
