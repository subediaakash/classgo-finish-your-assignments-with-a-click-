// https://classroom.googleapis.com/v1/courses/{courseId}/courseWork

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: PageProps) {
    const { id } = await params;

    console.log("Course ID:", id);

    const assignments = await fetch(`https://classroom.googleapis.com/v1/courses/${id}/courseWork`, {
        headers: {
            Authorization: `Bearer ${session?.token}`,
        },
    }); 

    return (
        <div>
            <h1>Course Work for Course: {id}</h1>
        </div>
    );
}                           

