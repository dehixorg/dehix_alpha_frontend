import { Toaster as Sonner } from "sonner"
import { CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />,
        error: <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />,
        warning: <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />,
        info: <Info className="h-4.5 w-4.5 text-blue-500 shrink-0" />,
        loading: <Loader2 className="h-4.5 w-4.5 animate-spin text-muted-foreground shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-neutral-950 group-[.toaster]:text-neutral-100 group-[.toaster]:border-neutral-800 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:border group-[.toaster]:font-sans group-[.toaster]:text-xs group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3",
          description: "group-[.toast]:text-neutral-400 group-[.toast]:text-[11px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:text-[10px] group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-neutral-400 group-[.toast]:text-[10px] group-[.toast]:font-semibold",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:text-emerald-100",
          error:
            "group-[.toaster]:border-rose-500/30 group-[.toaster]:text-rose-100",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:text-amber-100",
          info:
            "group-[.toaster]:border-blue-500/30 group-[.toaster]:text-blue-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
