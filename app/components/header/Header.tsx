import { MainHeader } from "./MainHeader";

export function Header() {
    return (
        <div className="flex flex-col w-full sticky top-0 z-50 bg-background">
            <MainHeader />
        </div>
    );
}
