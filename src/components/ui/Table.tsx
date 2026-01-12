import React, { ReactNode } from 'react';
import styles from './Table.module.css';
import { cn } from '@/lib/utils';

interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className }: TableProps) {
    return (
        <div className={styles.tableWrapper}>
            <table className={cn(styles.table, className)}>{children}</table>
        </div>
    );
}

interface TableHeaderProps {
    children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
    return <thead className={styles.header}>{children}</thead>;
}

interface TableBodyProps {
    children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
    return <tbody className={styles.body}>{children}</tbody>;
}

interface TableRowProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
    return (
        <tr
            className={cn(styles.row, onClick && styles.clickable, className)}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

interface TableHeadProps {
    children: ReactNode;
    className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
    return <th className={cn(styles.head, className)}>{children}</th>;
}

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
    return <td className={cn(styles.cell, className)}>{children}</td>;
}

