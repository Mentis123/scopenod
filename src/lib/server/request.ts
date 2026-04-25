export function getRequesterInfo(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip");

  return {
    ipAddress,
    userAgent: request.headers.get("user-agent")
  };
}
