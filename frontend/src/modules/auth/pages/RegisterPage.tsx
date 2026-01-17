import { RegisterForm } from "../components/RegisterForm";
import { FieldDescription } from "@/shared/ui/field";

export function RegisterPage() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <RegisterForm />
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
