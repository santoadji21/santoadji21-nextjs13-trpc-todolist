'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/utils/api';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';

import { useConfetti } from '@/hooks/useConfetti';
import {
  IconChevronDown,
  IconChevronUp,
  IconChevronsUp,
  IconCircle,
  IconCircleCheckFilled,
  IconMenu,
  IconTrash
} from '@tabler/icons-react';
import updateLocale from 'dayjs/plugin/updateLocale';

// Update the locale to customize the month abbreviation (Sept)
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
});

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
const schema = z.object({
  title: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).optional()
});

function getPriority(priority: string) {
  const priorityMap: { [key: string]: JSX.Element } = {
    LOW: <IconChevronDown className="text-indigo-400" />,
    MEDIUM: <IconMenu className="text-red-400" />,
    HIGH: <IconChevronUp className="text-red-500" />,
    HIGHEST: <IconChevronsUp className="text-red-600" />
  };
  return priorityMap[priority];
}

export default function Home() {
  const { todo } = trpc;
  const { list } = todo;
  const date = dayjs();
  const [toBeDeletedId, setToBeDeletedId] = useState<number | null>(null);
  const { fire, ConfettiCanvas } = useConfetti();
  const { setValue, control, getValues, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  });

  const { data: listTodo, isLoading: isTodoListLoading, refetch: refetchTodo } = list.useQuery();

  const createTodo = todo.create.useMutation({
    onError: () => {
      toast.error('Failed to create todo');
    }
  });

  function handleCreateTodo() {
    const mutationPromise = async () => {
      await createTodo.mutateAsync(getValues());
      return new Promise((resolve) => setTimeout(() => resolve('Done'), 1000));
    };
    toast.promise(mutationPromise(), {
      loading: 'Loading...',
      success: () => {
        refetchTodo();
        setValue('title', '');
        setValue('priority', undefined);
        return `Todo Created at ${date.format('h:mm A')}`;
      },
      error: 'Error'
    });
  }
  const updateTodo = todo.updateStatus.useMutation({
    onError: () => {
      toast.error('Failed to update todo');
    }
  });

  function handleCompleteTodo(id: number, completed: boolean) {
    const mutationPromise = async () => {
      await updateTodo.mutateAsync({
        id,
        completed
      });
      return new Promise((resolve) => setTimeout(() => resolve('Done'), 1000));
    };
    toast.promise(mutationPromise(), {
      loading: 'Updating...',
      success: () => {
        refetchTodo();
        fire();
        return `Todo Completed at ${date.format('h:mm A')}`;
      },
      error: 'Error'
    });
  }

  const deleteTodo = todo.deleteTodo.useMutation({
    onSuccess: () => {
      toast.success(`Todo Deleted at ${date.format('h:mm A')}`);
      refetchTodo();
      setTimeout(() => {
        setToBeDeletedId(null);
        // Clear the id after deletion
      }, 500);
    },
    onError: () => {
      toast.error('Failed to delete todo');
    }
  });

  useEffect(() => {
    if (toBeDeletedId !== null) {
      const currentTimeout = setTimeout(() => {
        deleteTodo.mutate(toBeDeletedId);
      }, 3400);
      // Cleanup function to clear the timeout if the component unmounts
      // or if `toBeDeletedId` changes before the timeout completes
      return () => {
        clearTimeout(currentTimeout);
      };
    }
  }, [toBeDeletedId, deleteTodo]);

  const handleDeleteClick = (id: number) => {
    setToBeDeletedId(id); // Set the Todo id that's set for deletion
    toast('Todo will be deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          setToBeDeletedId(null); // Clear the Todo id that was set for deletion
        }
      }
    });
  };

  return (
    <div className="mx-auto mt-20 max-w-3xl">
      {ConfettiCanvas}
      <Toaster richColors position="bottom-center" duration={3000} />
      <div className="flex min-h-[150px] items-center justify-center rounded-2xl bg-primary  ">
        <h1 className="text-6xl font-extrabold text-white">TODO LIST</h1>
      </div>
      <div className="my-6 flex flex-col gap-3">
        <Controller
          name="title"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              className="min-h-[48px]"
              placeholder="Enter Todo ..."
              onChange={onChange}
              value={value}
            />
          )}
        />
        <div className="flex gap-3">
          <Controller
            name="priority"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} value={value}>
                <SelectTrigger className="min-h-[50px] ">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Priority</SelectLabel>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="HIGHEST">Highest</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Button className="min-h-[48px] w-1/3" onClick={handleSubmit(handleCreateTodo)}>
            Add Todo
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {isTodoListLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-sm bg-slate-400 bg-opacity-40"></div>
            ))
          : listTodo
              ?.filter((todo) => todo.id !== toBeDeletedId)
              ?.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between rounded bg-slate-100 p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      onClick={() => {
                        if (todo.completed) return;
                        handleCompleteTodo(todo.id, !todo.completed);
                      }}>
                      {todo.completed ? <IconCircleCheckFilled /> : <IconCircle />}
                    </Button>
                    <h6>{todo.title}</h6>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div>{getPriority(todo.priority)}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{capitalizeFirstLetter(todo.priority)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="link"
                      onClick={() => {
                        handleDeleteClick(todo.id);
                      }}>
                      <IconTrash />
                    </Button>
                  </div>
                </div>
              ))}
      </div>
    </div>
  );
}
