import Link from "next/link";
import { Github, Mail } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50/50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-8 shadow-xl animate-in zoom-in-95 duration-500">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                        <span className="text-2xl font-bold text-primary-foreground">T</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email below to access your workspace
                    </p>
                </div>

                <LoginForm />
                {/* 
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div> */}

                {/* <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 rounded-lg border bg-background py-2 text-sm font-medium hover:bg-muted transition-colors">
                        <Github className="h-4 w-4" />
                        GitHub
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-lg border bg-background py-2 text-sm font-medium hover:bg-muted transition-colors">
                        <Mail className="h-4 w-4" />
                        Google
                    </button>
                </div> */}

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
