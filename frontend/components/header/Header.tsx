import { TopBar } from "./TopBar";
import { MainHeader } from "./MainHeader";
import { NavBar } from "./NavBar";

export function Header() {
    return (
        <div className="flex flex-col w-full relative z-50">
            <TopBar />
            <MainHeader />
            <NavBar />
        </div>
    );
}
