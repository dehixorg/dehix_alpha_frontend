'use client';

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { saveAs } from 'file-saver';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Switch } from '../ui/switch';
import { ButtonIcon } from '../shared/buttonIcon';

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
            properties: z
              .array(
                z.object({
                  name: z.string().nonempty('Nested nested name is required'),
                  type: z.string().nonempty('Nested nested type is required'),
                  required: z.boolean().optional(),
                }),
              )
              .optional(), // recursive support for more nesting
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

  // Function to handle adding a nested property (inside a nested property)
  const addNestedProperty = (index: number, nestedIndex?: number) => {
    const newProperties = getValues('properties');
    const targetProperty =
      nestedIndex === undefined
        ? newProperties[index]
        : newProperties[index].properties![nestedIndex];

    targetProperty.properties = targetProperty.properties || [];
    targetProperty.properties.push({
      name: '',
      type: '',
      required: false,
      properties: [], // Recursively add the properties field for further nesting
    });

    setValue('properties', newProperties);
  };

  // Function to remove a nested property
  const removeNestedProperty = (
    index: number,
    nestedIndex: number,
    nestedNestedIndex?: number,
  ) => {
    const newProperties = getValues('properties');
    if (nestedNestedIndex === undefined) {
      newProperties[index].properties?.splice(nestedIndex, 1);
    } else {
      newProperties[index].properties![nestedIndex].properties?.splice(
        nestedNestedIndex,
        1,
      );
    }
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
      // Handling nested properties recursively
      if (prop.properties && prop.properties.length > 0) {
        schema.body.properties[prop.name].properties = {};
        prop.properties.forEach((nestedProp, nestedIndex) => {
          schema.body.properties[prop.name].properties[nestedProp.name] = {
            type: nestedProp.type,
          };
          if (nestedProp.required) {
            if (!schema.body.properties[prop.name].required) {
              schema.body.properties[prop.name].required = [];
            }
            schema.body.properties[prop.name].required.push(nestedProp.name);
          }
          // Recursively handle deeper nested properties
          if (nestedProp.properties && nestedProp.properties.length > 0) {
            schema.body.properties[prop.name].properties[
              nestedProp.name
            ].properties = {};
            nestedProp.properties.forEach((nestedNestedProp) => {
              schema.body.properties[prop.name].properties[
                nestedProp.name
              ].properties[nestedNestedProp.name] = {
                type: nestedNestedProp.type,
              };
              if (nestedNestedProp.required) {
                if (
                  !schema.body.properties[prop.name].properties[nestedProp.name]
                    .required
                ) {
                  schema.body.properties[prop.name].properties[
                    nestedProp.name
                  ].required = [];
                }
                schema.body.properties[prop.name].properties[
                  nestedProp.name
                ].required.push(nestedNestedProp.name);
              }
            });
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
          {fields.map((field, index) => (
            <Card key={field.id} className="mb-4 relative">
              {/* Remove Button */}
              <CardHeader className="flex flex-row">
                Body
                <ButtonIcon
                  className="bg-red ml-auto"
                  icon={<X className="h-4 w-4" />}
                  onClick={() => {
                    // Remove the property along with its nested properties
                    remove(index);
                  }}
                />
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
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
                          onValueChange={(value) => field.onChange(value)}
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
                            checked={field.value ?? false}
                            onCheckedChange={(value) => field.onChange(value)}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>

                {/* Add Nested Property button inside properties */}
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

                {/* Nested Properties */}
                {field.properties?.map((nested, nestedIndex) => (
                  <Card key={nestedIndex} className="mt-2 col-span-2 gap-4">
                    <CardHeader className="flex flex-row">
                      Nested Property
                      <ButtonIcon
                        className="bg-red ml-auto"
                        icon={<X className="h-4 w-4" />}
                        onClick={() => removeNestedProperty(index, nestedIndex)}
                      />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name={`properties.${index}.properties.${nestedIndex}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Name</FormLabel>
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
                                onValueChange={(value) => field.onChange(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {swaggerTypes.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
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
                                  checked={field.value ?? false}
                                  onCheckedChange={(value) =>
                                    field.onChange(value)
                                  }
                                />
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </div>

                      {/* Add Nested Nested Property button inside nested properties */}
                      {(nested.type === 'object' ||
                        nested.type === 'array') && (
                        <div className="col-span-2">
                          <Button
                            type="button"
                            onClick={() =>
                              addNestedProperty(index, nestedIndex)
                            }
                          >
                            Add Nested Nested Property
                          </Button>
                        </div>
                      )}

                      {/* Nested Nested Properties */}
                      {nested.properties?.map(
                        (nestedNested, nestedNestedIndex) => (
                          <Card
                            key={nestedNestedIndex}
                            className="mt-2 col-span-2 gap-4"
                          >
                            <CardHeader className="flex flex-row">
                              Nested Nested Property
                              <ButtonIcon
                                className="bg-red ml-auto"
                                icon={<X className="h-4 w-4" />}
                                onClick={() =>
                                  removeNestedProperty(
                                    index,
                                    nestedIndex,
                                    nestedNestedIndex,
                                  )
                                }
                              />
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                              <FormField
                                control={control}
                                name={`properties.${index}.properties.${nestedIndex}.properties.${nestedNestedIndex}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nested Nested Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Nested Nested Name"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={control}
                                name={`properties.${index}.properties.${nestedIndex}.properties.${nestedNestedIndex}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                      <Select
                                        {...field}
                                        onValueChange={(value) =>
                                          field.onChange(value)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {swaggerTypes.map((type) => (
                                            <SelectItem
                                              key={type.value}
                                              value={type.value}
                                            >
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
                                  <FormLabel className="mr-2">
                                    Required
                                  </FormLabel>
                                  <br />
                                  <FormControl>
                                    <Controller
                                      name={`properties.${index}.properties.${nestedIndex}.properties.${nestedNestedIndex}.required`}
                                      control={control}
                                      render={({ field }) => (
                                        <Switch
                                          checked={field.value ?? false}
                                          onCheckedChange={(value) =>
                                            field.onChange(value)
                                          }
                                        />
                                      )}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
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
