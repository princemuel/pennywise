import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useActionState } from "react";

import { SignUpSchema as schema } from "@/schema/auth";
import { signup } from "@/server/auth";

export const Route = createFileRoute("/(auth)/signup")({
  component: Page,
});

function Page() {
  const [lastResult, action] = useActionState(signup, undefined);
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <form
      action={action}
      {...getFormProps(form)}
      className="mx-auto flex w-full max-w-2xl flex-col gap-8 rounded-xl bg-white px-8 py-12 shadow-md"
    >
      <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
        Sign Up
      </h1>

      <div className="flex flex-col gap-4">
        <label htmlFor={fields.name.id} className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-grey-900">Name</span>
          <input
            {...getInputProps(fields.name, { type: "text" })}
            placeholder="John Doe"
            className="rounded border border-grey-300 px-4 py-2"
          />
          {fields.name.errors && (
            <span className="text-sm text-red-500">{fields.name.errors[0]}</span>
          )}
        </label>

        <label htmlFor={fields.email.id} className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-grey-900">Email</span>
          <input
            {...getInputProps(fields.email, { type: "email" })}
            placeholder="user@example.com"
            className="rounded border border-grey-300 px-4 py-2"
          />
          {fields.email.errors && (
            <span className="text-sm text-red-500">{fields.email.errors[0]}</span>
          )}
        </label>

        <label htmlFor={fields.password.id} className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-grey-900">Password</span>
          <input
            {...getInputProps(fields.password, { type: "password" })}
            placeholder="••••••••"
            className="rounded border border-grey-300 px-4 py-2"
          />
          {fields.password.errors && (
            <span className="text-sm text-red-500">{fields.password.errors[0]}</span>
          )}
        </label>
      </div>

      <button
        type="submit"
        className="rounded bg-brand-500 px-6 py-2 font-semibold text-white hover:bg-brand-600"
      >
        Create Account
      </button>

      <p className="text-center text-sm text-grey-500">
        Already have an account?{" "}
        <Link to="/signin" className="font-semibold text-brand-500 hover:text-brand-600">
          Sign In
        </Link>
      </p>
    </form>
  );
}
