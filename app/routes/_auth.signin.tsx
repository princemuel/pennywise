import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { useState } from "react";
import { Form, Link } from "react-router";

import { IconEye, IconEyeSlash } from "@/assets/media/icons";
import { Pot } from "@/components/pot";

import type { Route } from "./+types/_auth.signin";
import { signin as schema } from "./_auth.schema";

export async function action({ request }: Route.ActionArgs) {
  const submission = parseWithZod(await request.formData(), { schema });
  if (submission.status !== "success") return submission.reply();
}

export default function Page({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    lastResult: actionData,
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  const [inputType, setInputType] = useState<"password" | "text">("password");

  function handlePassword() {
    setInputType((prev) => (prev === "password" ? "text" : "password"));
  }

  return (
    <Form
      method="post"
      className="mx-auto flex w-full max-w-2xl flex-col gap-8 rounded-xl bg-white px-8 py-12 shadow-md"
      {...getFormProps(form)}
    >
      <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
        Login
      </h1>

      <section className="grid grid-cols-6 gap-5">
        <Pot />
        <div className="group col-span-full flex flex-col gap-2">
          <label htmlFor={fields.email.id} className="text-xs font-bold text-grey-500">
            Email
          </label>
          <input
            {...getInputProps(fields.email, { type: "email" })}
            aria-autocomplete="list"
            className="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
            autoComplete="email"
          />
          <span id={fields.email.errorId} className="self-end text-xs text-red-400">
            {fields.email.errors}
          </span>
        </div>

        <div className="group col-span-full flex flex-col gap-2">
          <label htmlFor={fields.password.id} className="text-xs font-bold text-grey-500">
            password
          </label>
          <div className="flex items-center rounded-lg border border-beige-500 px-5">
            <input
              {...getInputProps(fields.password, { type: inputType })}
              aria-autocomplete="list"
              className="flex-1 bg-transparent py-4 text-grey-900 outline-none autofill:bg-transparent focus:outline-0"
              autoComplete="current-password"
            />

            <button type="button" className="text-grey-900" onClick={() => handlePassword()}>
              {inputType === "password" ? <IconEye /> : <IconEyeSlash />}
            </button>
          </div>
          <span id={fields.password.errorId} className="self-end text-xs text-red-400">
            {fields.password.errors}
          </span>
        </div>
      </section>

      <button type="submit" className="rounded-lg bg-grey-900 py-4 text-center text-white">
        Login
      </button>

      <footer className="flex items-center justify-center gap-4">
        <p className="text-sm text-grey-500">Need to create an account?</p>
        <Link to="/signup" className="font-bold text-grey-900 underline" viewTransition>
          Sign up
        </Link>
      </footer>
    </Form>
  );
}
