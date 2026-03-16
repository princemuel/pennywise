<script lang="ts">
  import { Control, Field, FieldErrors, Label } from "formsnap";
  import { superForm } from "sveltekit-superforms";
  import { zod4Client } from "sveltekit-superforms/adapters";
  import { schema } from "./schema.js";

  import { IconEye, IconEyeSlash } from "@/assets/media/icons";
  import Honeypot from "@/components/honeypot.svelte";

  let { data } = $props();

  // svelte-ignore state_referenced_locally
  const form = superForm(data.form, { validators: zod4Client(schema) });

  let type = $state<"password" | "text">("password");

  function handlePassword() {
    type = type === "password" ? "text" : "password";
  }

  const { form: formData, enhance } = form;
</script>

<form
  method="POST"
  class="mx-auto flex w-full max-w-2xl flex-col gap-8 rounded-xl bg-white px-8 py-12 shadow-md"
  use:enhance
>
  <h1 id="a11ty-headline" class="text-4xl font-bold text-grey-900">Sign up</h1>

  <section class="grid grid-cols-6 gap-5">
    <Honeypot />

    <div class="group col-span-full flex flex-col gap-2">
      <Field {form} name="name">
        <Control>
          {#snippet children({ props })}
            <Label class="text-xs font-bold text-grey-500">Name</Label>
            <input
              {...props}
              type="text"
              bind:value={$formData.name}
              aria-autocomplete="list"
              class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
              autoComplete="name"
            />
          {/snippet}
        </Control>
        <FieldErrors class="self-end text-xs text-red-400" />
      </Field>
    </div>

    <div class="group col-span-full flex flex-col gap-2">
      <Field {form} name="email">
        <Control>
          {#snippet children({ props })}
            <Label class="text-xs font-bold text-grey-500">Email</Label>
            <input
              {...props}
              type="email"
              bind:value={$formData.email}
              aria-autocomplete="list"
              class="rounded-lg border border-beige-500 bg-transparent px-5 py-4 text-grey-900 outline-none autofill:bg-transparent autofill:focus:bg-transparent"
              autoComplete="email"
            />
          {/snippet}
        </Control>
        <FieldErrors class="self-end text-xs text-red-400" />
      </Field>
    </div>

    <div class="group col-span-full flex flex-col gap-2">
      <Field {form} name="password">
        <Control>
          {#snippet children({ props })}
            <Label class="text-xs font-bold text-grey-500">Create Password</Label>
            <div class="flex items-center rounded-lg border border-beige-500 px-5">
              <input
                {...props}
                {type}
                bind:value={$formData.password}
                aria-autocomplete="list"
                class="flex-1 bg-transparent py-4 text-grey-900 outline-none autofill:bg-transparent focus:outline-0"
                autoComplete="current-password"
              />

              <button type="button" class="text-grey-900" onclick={() => handlePassword()}>
                {#if type === "password"}
                  <IconEye />
                {:else}
                  <IconEyeSlash />
                {/if}
              </button>
            </div>
          {/snippet}
        </Control>
        <FieldErrors class="self-end text-xs text-red-400" />
      </Field>
    </div>
  </section>

  <button type="submit" class="rounded-lg bg-grey-900 py-4 text-center text-white">
    Create Account
  </button>

  <footer class="flex items-center justify-center gap-4">
    <p class="text-sm text-grey-500">Already have an account?</p>
    <a href="/signin" class="font-bold text-grey-900 underline">Sign in</a>
  </footer>
</form>
