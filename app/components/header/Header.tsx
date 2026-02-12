import { TopBar } from "./TopBar";
import { MainHeader } from "./MainHeader";

export function Header() {
    return (
        <div className="flex flex-col w-full relative z-50">
            <TopBar />
            <MainHeader />
        </div>
    );
}
