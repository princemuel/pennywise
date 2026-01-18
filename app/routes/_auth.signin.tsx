import type { Route } from './_auth.signin';

export async function action({}: Route.ActionArgs) {
	return redirect('/');
}

export default function Page() {
	return (
		<main className="">
			<Form>
				<h1>Sign In</h1>
			</Form>
		</main>
	);
}
