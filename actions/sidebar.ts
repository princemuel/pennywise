export async function action({ request }: Route.ActionArgs) {
  // oxlint-disable-next-line typescript/strict-boolean-expressions
  const cookie = (await userPrefs.parse(request.headers.get("Cookie"))) || {};
  const formData = await request.formData();
  cookie.minimize = formData.get("minimize") === "true";
  return data(null, { headers: { "Set-Cookie": await userPrefs.serialize(cookie) } });
}
