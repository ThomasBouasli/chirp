"use client";

const ErrorPage = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="border-border flex w-full max-w-sm flex-col gap-10 rounded border px-5 py-20 text-center">
        <h1 className="text-4xl font-bold">Oops... Something went wrong!</h1>
        <p className="text-lg">{error.message}</p>
        <button
          className="border-border rounded border px-4 py-2"
          onClick={reset}
        >
          Reload
        </button>
      </div>
    </div>
  );
};
export default ErrorPage;
