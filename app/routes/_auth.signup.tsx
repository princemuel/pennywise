import { Form, redirect } from 'react-router';

import type { Route } from './_auth.signup';

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
