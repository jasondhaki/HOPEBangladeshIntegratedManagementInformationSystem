"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Throwaway schema for this primitives demo — no `organisation_settings` table
// exists yet, so there is no real entity schema in `lib/validation` to build
// a form against. Replace this whole file once Settings gets real config.
export const settingsDemoSchema = z.object({
  organisationName: z
    .string()
    .min(2, "Enter at least 2 characters.")
    .max(100, "Keep it under 100 characters."),
  defaultLanguage: z.enum(["en", "bn"]),
  notifyByEmail: z.boolean(),
})

export type SettingsDemoValues = z.infer<typeof settingsDemoSchema>

export function SettingsDemoForm() {
  const [savedAt, setSavedAt] = React.useState<number | null>(null)

  const form = useForm<SettingsDemoValues>({
    resolver: zodResolver(settingsDemoSchema),
    defaultValues: {
      organisationName: "",
      defaultLanguage: "en",
      notifyByEmail: true,
    },
  })

  function onSubmit(values: SettingsDemoValues) {
    void values
    setSavedAt(Date.now())
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="organisationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisation display name</FormLabel>
              <FormControl>
                <Input placeholder="HOPE Worldwide Bangladesh" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default language</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bangla</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Applies to new users until they choose their own.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notifyByEmail"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Send email notifications
              </FormLabel>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit">Save</Button>
          {savedAt ? (
            <span className="text-sm text-muted-foreground">
              Validated — this demo does not persist data.
            </span>
          ) : null}
        </div>
      </form>
    </Form>
  )
}
