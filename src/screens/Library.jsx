import Section from "../components/Section";

export default function Library({
                                    currentlyReading,
                                    wantToRead,
                                    interrupted,
                                    finished,
                                    customSections,
                                    setSelectedBook,
                                    styles,
                                }) {
    return (
        <>
            <Section title="Currently reading" items={currentlyReading} onPick={(b) => setSelectedBook(b)} styles={styles}/>
            <Section title="Want to read" items={wantToRead} onPick={(b) => setSelectedBook(b)} styles={styles}/>
            <Section title="Interrupted" items={interrupted} onPick={(b) => setSelectedBook(b)} styles={styles}/>
            <Section title="Finished" items={finished} onPick={(b) => setSelectedBook(b)} styles={styles}/>

            {customSections.map((sec) => (
                <Section key={sec.name} title={sec.name} items={sec.items} onPick={(b) => setSelectedBook(b)} styles={styles}/>
            ))}
        </>
    );
}
