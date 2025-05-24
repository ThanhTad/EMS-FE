// components/shared/SectionWrapper.tsx
"use client";

import { cn } from "@/lib/utils";
import React, { ComponentProps } from "react";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  // Optional: cho phép truyền props animation riêng nếu muốn
  motionProps?: ComponentProps<typeof motion.section>;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  motionProps,
}) => {
  return (
    <motion.section
      className={cn("py-12 md:py-16 lg:py-20", className)}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      {...motionProps}
    >
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className="mb-8 text-center md:mb-12">
            {subtitle && (
              <p
                className={cn(
                  "mb-2 text-base font-semibold uppercase tracking-wider text-primary",
                  subtitleClassName
                )}
              >
                {subtitle}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  "text-3xl font-bold tracking-tight text-foreground sm:text-4xl",
                  titleClassName
                )}
              >
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </motion.section>
  );
};

export default SectionWrapper;
