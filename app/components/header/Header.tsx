import { MainHeader } from "./MainHeader";

export function Header() {
    return (
        <div className="flex flex-col w-full fixed top-0 left-0 right-0 z-[501] bg-background">
            <MainHeader />
        </div>
    );
}
