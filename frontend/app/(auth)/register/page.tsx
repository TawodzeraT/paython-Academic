'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Please check your email to verify.');
      router.push('/login');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create your account</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Start learning Python today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Full name"
          placeholder="Jane Smith"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-xs text-gray-400 hover:text-gray-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <Input
          id="confirmPassword"
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" isLoading={isLoading} className="w-full mt-1">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
