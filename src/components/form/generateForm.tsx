'use client';

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { saveAs } from 'file-saver';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card } from '../ui/card';
import { Switch } from '../ui/switch';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const swaggerTypes = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Object', value: 'object' },
  { label: 'Array', value: 'array' },
  { label: 'NULL', value: 'null' },
  // Add more types if needed
];

// Define the Zod schema with Typescript types
const schemaFormSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string()).optional(),
  properties: z.array(
    z.object({
      name: z.string().nonempty('Name is required'),
      type: z.string().nonempty('Type is required'),
      required: z.boolean().optional(),
      properties: z
        .array(
          z.object({
            name: z.string().nonempty('Nested name is required'),
            type: z.string().nonempty('Nested type is required'),
            required: z.boolean().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

type SchemaFormValues = z.infer<typeof schemaFormSchema>;

export default function CreateSchemaForm() {
  const form = useForm<SchemaFormValues>({
    resolver: zodResolver(schemaFormSchema),
    defaultValues: {
      description: '',
      tags: [],
      properties: [{ name: '', type: '', required: false, properties: [] }],
    },
  });

  const { control, handleSubmit, register, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'properties',
  });

  // Function to handle nested properties
  const addNestedProperty = (index: number) => {
    const newProperties = getValues('properties');
    newProperties[index].properties = newProperties[index].properties || [];
    newProperties[index].properties.push({
      name: '',
      type: '',
      required: false,
    });
    setValue('properties', newProperties);
  };

  // Generate schema structure
  const generateSchema = (data: SchemaFormValues) => {
    const schema: {
      description: string;
      tags: string[];
      body: {
        type: string;
        properties: Record<string, any>;
        required: string[];
      };
    } = {
      description: data.description,
      tags: data.tags || [],
      body: {
        type: 'object',
        properties: {},
        required: [],
      },
    };

    data.properties.forEach((prop) => {
      schema.body.properties[prop.name] = { type: prop.type };
      if (prop.required) {
        schema.body.required.push(prop.name);
      }
      // Handling nested properties
      if (prop.properties && prop.properties.length > 0) {
        schema.body.properties[prop.name].properties = {};
        prop.properties.forEach((nestedProp) => {
          schema.body.properties[prop.name].properties[nestedProp.name] = {
            type: nestedProp.type,
          };
          if (nestedProp.required) {
            schema.body.required.push(nestedProp.name);
          }
        });
      }
    });

    return schema;
  };

  // Submit handler to generate schema file and copy to clipboard
  const onSubmit = (data: SchemaFormValues) => {
    const schemaJson = generateSchema(data);
    const schemaString = JSON.stringify(schemaJson, null, 2);

    // Save file
    const blob = new Blob([schemaString], { type: 'application/json' });
    // saveAs(blob, 'schema.json');

    // Copy to clipboard
    navigator.clipboard.writeText(schemaString).then(() => {
      alert('Schema JSON copied to clipboard');
    });
  };

  return (
    <Card className="p-5 mt-4 w-full">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Tags</FormLabel>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Comma-separated tags"
                  value={field.value?.join(', ') || ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(',').map((tag) => tag.trim()),
                    )
                  }
                />
              )}
            />
            <FormMessage />
          </FormItem>

          <h3>Properties</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border p-4 mb-4 grid grid-cols-2 gap-4"
            >
              <FormField
                control={control}
                name={`properties.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter property name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`properties.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={(value) => field.onChange(value)} // Ensure form state is updated on value change
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          {swaggerTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2 flex items-center">
                <FormItem>
                  <FormLabel className="mr-2">Required</FormLabel>
                  <br />
                  <FormControl>
                    <Controller
                      name={`properties.${index}.required`}
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value ?? false} // Ensure it's set to false if undefined
                          onCheckedChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              {/* Add Nested Property button only for 'object' or 'array' types */}
              {(getValues(`properties.${index}.type`) === 'object' ||
                getValues(`properties.${index}.type`) === 'array') && (
                <div className="col-span-2">
                  <Button
                    type="button"
                    onClick={() => addNestedProperty(index)}
                  >
                    Add Nested Property
                  </Button>
                </div>
              )}

              {field.properties?.map((nested, nestedIndex) => (
                <Card
                  key={nestedIndex}
                  className="border p-2 mt-2 grid grid-cols-2 col-span-2 gap-4"
                >
                  <FormField
                    control={control}
                    name={`properties.${index}.properties.${nestedIndex}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nested Property Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nested name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`properties.${index}.properties.${nestedIndex}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={(value) => field.onChange(value)} // Ensure form state is updated on value change
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              {swaggerTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2 flex items-center">
                    <FormItem>
                      <FormLabel className="mr-2">Required</FormLabel>
                      <br />
                      <FormControl>
                        <Controller
                          name={`properties.${index}.properties.${nestedIndex}.required`}
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value ?? false} // Ensure it's set to false if undefined
                              onCheckedChange={(value) => field.onChange(value)}
                            />
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </Card>
              ))}
            </div>
          ))}

          <Button
            type="button"
            onClick={() =>
              append({ name: '', type: '', required: false, properties: [] })
            }
          >
            Add Property
          </Button>
          <br />
          <Button type="submit">Generate Schema</Button>
        </form>
      </Form>
    </Card>
  );
}
