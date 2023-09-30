import { createTrpcRouter, publicProcedure } from '@/app/api/trpc/trpc';
import * as z from 'zod';
import { db } from '@/utils/db';

const TodoInput = z.object({
  title: z.string(),
  completed: z.optional(z.boolean()),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).default('LOW').optional()
});
const UpdateTodoInput = z.object({
  id: z.number(),
  completed: z.optional(z.boolean())
});

export const todoRouters = createTrpcRouter({
  // Create a new todo
  create: publicProcedure.input(TodoInput).mutation(async ({ input }) => {
    return db.todo.create({
      data: input
    });
  }),

  // Retrieve all todos
  list: publicProcedure.query(async () => {
    return db.todo.findMany({
      orderBy: {
        completed: 'desc'
      }
    });
  }),

  // Update a todo by ID
  update: publicProcedure.input(UpdateTodoInput).mutation(async ({ input }) => {
    const validatedInput = z
      .object({
        id: z.number(),
        title: z.string(),
        completed: z.optional(z.boolean())
      })
      .parse(input);

    return db.todo.update({
      where: { id: validatedInput.id },
      data: {
        title: validatedInput.title,
        completed: validatedInput.completed
      }
    });
  }),
  // Update a todo by ID
  updateStatus: publicProcedure.input(UpdateTodoInput).mutation(async ({ input }) => {
    const validatedInput = z
      .object({
        id: z.number(),
        completed: z.optional(z.boolean())
      })
      .parse(input);
    return db.todo.update({
      where: { id: validatedInput.id },
      data: {
        completed: validatedInput.completed
      }
    });
  }),

  // Delete a todo by ID
  deleteTodo: publicProcedure.input(z.number()).mutation(async ({ input }) => {
    return db.todo.delete({
      where: { id: input }
    });
  })
});
