import { MainHeader } from "./MainHeader";

export function Header() {
    return (
        <div
            className="flex flex-col w-full fixed top-0 left-0 right-0 z-[900] bg-cover bg-center"
            style={{ backgroundImage: "url('/theme/image copy.png')" }}
        >
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            <div className="relative z-10">
                <MainHeader />
            </div>
        </div>
    );
}
