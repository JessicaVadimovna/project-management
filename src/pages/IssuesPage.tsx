import { useQuery } from '@tanstack/react-query';

const fetchIssues = async () => {
    const res = await fetch('http://localhost:5000/issues');
    return res.json();
};

const IssuesPage = () => {
    const { data, isLoading } = useQuery({ queryKey: ['issues'], queryFn: fetchIssues });

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div>
            <h1>Все задачи</h1>
            {data.map((issue: any) => (
                <div key={issue.id}>{issue.title}</div>
            ))}
        </div>
    );
};

export default IssuesPage;