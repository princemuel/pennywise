"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod/v4";
import { useActionState, useState } from "react";

import { IconEye, IconEyeSlash } from "@/assets/media/icons";

import { signup } from "@/actions/auth";
import { SignUpSchema as schema } from "@/schema/auth";

import Form from "next/form";
import Link from "next/link";

export default function Page() {
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

  const [type, setType] = useState<"password" | "text">("password");

  function handlePassword() {
    return type === "password" ? setType("text") : setType("password");
  }

  return (
    <Form
      action={action}
      {...getFormProps(form)}
      className="mx-auto flex w-full max-w-2xl flex-col gap-8 rounded-xl bg-white px-8 py-12 shadow-md"
    >
      <h1 id="a11ty-headline" className="text-4xl font-bold text-grey-900">
        Sign up
      </h1>

      <section className="grid grid-cols-6 gap-5">
        <input type="hidden" name="honeypot" placeholder="do not fill this" className="sr-only" />

        <div className="group col-span-full flex flex-col gap-2">
          <label className="text-xs font-bold text-grey-500" htmlFor={fields.name.id}>
            Name
          </label>

          <input
            {...getInputProps(fields.name, { type: "text" })}
            aria-autocomplete="list"
            className="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent"
            autoComplete="name"
          />

          <span
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className="self-end text-xs text-red-400"
            id={fields.name.errorId}
          >
            {fields.name.errors?.join("\n")}
          </span>
        </div>

        <div className="group col-span-full flex flex-col gap-2">
          <label className="text-xs font-bold text-grey-500" htmlFor={fields.email.id}>
            Email
          </label>

          <input
            {...getInputProps(fields.email, { type: "email" })}
            aria-autocomplete="list"
            className="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent"
            autoComplete="email"
          />

          <span
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className="self-end text-xs text-red-400"
            id={fields.email.errorId}
          >
            {fields.email.errors?.join("\n")}
          </span>
        </div>

        <div className="group col-span-full flex flex-col gap-2">
          <label className="text-xs font-bold text-grey-500" htmlFor={fields.password.id}>
            Create Password
          </label>

          <div className="flex items-center rounded-lg border border-beige-500 px-5">
            <input
              {...getInputProps(fields.password, { type })}
              aria-autocomplete="list"
              className="flex-1 bg-transparent py-4 text-grey-900 outline-none autofill:bg-transparent focus:outline-0"
              autoComplete="new-password"
            />

            <button type="button" onClick={handlePassword} className="text-grey-900">
              {type === "password" ? <IconEye /> : <IconEyeSlash />}
            </button>
          </div>

          <span
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className="self-end text-xs text-red-400"
            id={fields.password.errorId}
          >
            {fields.password.errors?.join("\n")}
          </span>
        </div>
      </section>

      <button type="submit" className="rounded-lg bg-grey-900 py-4 text-center text-white">
        Create Account
      </button>

      <footer className="flex items-center justify-center gap-4">
        <p className="text-sm text-grey-500">Already have an account?</p>
        <Link href="/signin" className="font-bold text-grey-900 underline">
          Sign in
        </Link>
      </footer>
    </Form>
  );
}
