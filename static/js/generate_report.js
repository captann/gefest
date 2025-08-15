async function generateReport() {
    const reportData = {};

    for (const [holding, homeIds] of Object.entries(holdingsDict)) {
        const uncompletedTasksByHome = {};

        homeIds.forEach(home_id => {
            const taskList = tasks[home_id] || [];
            const uncompleted = taskList.filter(t => t.blank !== 1);
            if (uncompleted.length > 0) {
                uncompletedTasksByHome[home_id] = uncompleted;
            }
        });

        if (Object.keys(uncompletedTasksByHome).length > 0) {
            reportData[holding] = uncompletedTasksByHome;
        }
    }

    try {
        const now = new Date();
        const formattedDate = now.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).replace(/[\s:]/g, "_").replace(",", "");

            const payload = {
            reportData: reportData,
            polygonsData: polygonsData,  // добавленное поле
            date: formattedDate,
            report_type: document.getElementById("map-change-section").value
        };
        const response = await fetch('/generate_report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Ошибка при генерации отчёта');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${formattedDate}.html`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (e) {
        alert(e.message);
    }
}


document.getElementById('generate-report-link').addEventListener('click', generateReport);
