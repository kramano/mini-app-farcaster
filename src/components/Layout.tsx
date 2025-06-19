// components/Layout.tsx
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen w-full bg-white text-gray-900 overflow-x-hidden px-4 text-center">
            {children}
        </div>
    );
};

export default Layout;
