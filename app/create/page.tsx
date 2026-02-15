import { ListingForm } from "../components/create/ListingForm";
import { NavBar } from "../components/header/NavBar";

export default function CreateListingPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            {/* We can optionally include the main NavBar or keep it distraction-free */}
            {/* For now, let's keep it distraction-free as per requirements, so no NavBar here */}
            {/* But we might want a simple wrapper if needed */}

            <div className="pt-6 px-4">
                <ListingForm />
            </div>
        </main>
    );
}
