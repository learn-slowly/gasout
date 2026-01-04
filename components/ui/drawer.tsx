'use client';

import * as React from 'react';
import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const Drawer = ({
    shouldScaleBackground = true,
    ...props
}: React.ComponentProps<typeof VaulDrawer.Root>) => (
    <VaulDrawer.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = VaulDrawer.Trigger;

const DrawerPortal = VaulDrawer.Portal;

const DrawerClose = VaulDrawer.Close;

const DrawerContent = React.forwardRef<
    React.ElementRef<typeof VaulDrawer.Content>,
    React.ComponentPropsWithoutRef<typeof VaulDrawer.Content> & {
        showHandle?: boolean;
        showClose?: boolean;
        containerClassName?: string;
    }
>(({ className, children, showHandle = true, showClose = false, containerClassName, ...props }, ref) => (
    <DrawerPortal>
        <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <VaulDrawer.Content
            ref={ref}
            className={cn(
                'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[20px] border bg-background ring-offset-background focus:outline-none',
                className
            )}
            {...props}
        >
            <div className={cn("mx-auto w-full max-w-md flex flex-col h-full", containerClassName)}>
                {showHandle && (
                    <div className="mx-auto mt-4 h-1.5 w-[40px] flex-shrink-0 rounded-full bg-muted-foreground/30" />
                )}
                {showClose && (
                    <div className="absolute top-4 right-4 z-50">
                        <DrawerClose asChild>
                            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </DrawerClose>
                    </div>
                )}
                <div className="flex-1 overflow-auto p-4">{children}</div>
            </div>
        </VaulDrawer.Content>
    </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
        {...props}
    />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('mt-auto flex flex-col gap-2 p-4', className)}
        {...props}
    />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
    React.ElementRef<typeof VaulDrawer.Title>,
    React.ComponentPropsWithoutRef<typeof VaulDrawer.Title>
>(({ className, ...props }, ref) => (
    <VaulDrawer.Title
        ref={ref}
        className={cn(
            'text-lg font-semibold leading-none tracking-tight',
            className
        )}
        {...props}
    />
));
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef<
    React.ElementRef<typeof VaulDrawer.Description>,
    React.ComponentPropsWithoutRef<typeof VaulDrawer.Description>
>(({ className, ...props }, ref) => (
    <VaulDrawer.Description
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
    />
));
DrawerDescription.displayName = 'DrawerDescription';

export {
    Drawer,
    DrawerPortal,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
};

export const DrawerOverlay = VaulDrawer.Overlay;
