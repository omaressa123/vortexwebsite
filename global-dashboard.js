// Chart defaults
Chart.defaults.color = '#b0b0c0';
Chart.defaults.borderColor = '#2a2f4a';
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

// 1. Sales by Segment (Donut Chart)
const segmentCtx = document.getElementById('segmentChart').getContext('2d');
const segmentChart = new Chart(segmentCtx, {
    type: 'doughnut',
    data: {
        labels: ['Home Office', 'Corporate', 'Consumer'],
        datasets: [{
            data: [2.1, 3.1, 6.4],
            backgroundColor: [
                '#ff4d4f',
                '#ff7a7a',
                '#ffb3b3'
            ],
            borderColor: '#1a1f3a',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

// 2. Sales by Year, Quarter and Category (Line Chart)
const categoryCtx = document.getElementById('categoryChart').getContext('2d');
const categoryChart = new Chart(categoryCtx, {
    type: 'line',
    data: {
        labels: ['Jan 2019', 'Jul 2019', 'Jan 2020', 'Jul 2020', 'Jan 2021', 'Jul 2021', 'Jan 2022', 'Jul 2022'],
        datasets: [
            {
                label: 'Furniture',
                data: [0.11, 0.13, 0.14, 0.13, 0.22, 0.27, 0.35, 0.56],
                borderColor: '#ff4d4f',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#ff4d4f'
            },
            {
                label: 'Office Supplies',
                data: [0.12, 0.14, 0.15, 0.14, 0.21, 0.25, 0.34, 0.45],
                borderColor: '#ff7a7a',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#ff7a7a'
            },
            {
                label: 'Technology',
                data: [0.10, 0.12, 0.13, 0.12, 0.20, 0.23, 0.45, 0.63],
                borderColor: '#ffb3b3',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#ffb3b3'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(42, 47, 74, 0.3)'
                },
                ticks: {
                    font: { size: 10 },
                    color: '#b0b0c0'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: { size: 10 },
                    color: '#b0b0c0'
                }
            }
        }
    }
});

// 3. Year, Quarter Category (Line Chart - Bottom Left)
const yearQuarterCtx = document.getElementById('yearQuarterChart').getContext('2d');
const yearQuarterChart = new Chart(yearQuarterCtx, {
    type: 'line',
    data: {
        labels: ['Jan 2019', 'Jul 2019', 'Jan 2020', 'Jul 2020', 'Jan 2021', 'Jul 2021', 'Jan 2022', 'Jul 2022'],
        datasets: [
            {
                label: 'Furniture',
                data: [0.11, 0.13, 0.14, 0.13, 0.22, 0.27, 0.35, 0.56],
                borderColor: '#ff4d4f',
                backgroundColor: 'rgba(255, 77, 79, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ff4d4f',
                pointBorderColor: '#1a1f3a',
                pointBorderWidth: 2
            },
            {
                label: 'Office Supplies',
                data: [0.12, 0.14, 0.15, 0.14, 0.21, 0.25, 0.34, 0.45],
                borderColor: '#ff7a7a',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ff7a7a'
            },
            {
                label: 'Technology',
                data: [0.10, 0.12, 0.13, 0.12, 0.20, 0.23, 0.45, 0.63],
                borderColor: '#ffb3b3',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#ffb3b3'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(42, 47, 74, 0.3)'
                },
                ticks: {
                    font: { size: 10 },
                    color: '#b0b0c0'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: { size: 10 },
                    color: '#b0b0c0'
                }
            }
        }
    }
});

// 4. Profit by Product [Top 5]
const profitCtx = document.getElementById('profitChart').getContext('2d');
const profitChart = new Chart(profitCtx, {
    type: 'bar',
    data: {
        labels: ['Canon imageCLASS 2200 Advanced...', 'Cisco Systems Full Sale', 'Motorola Smart Full Size', 'Hoover Turbo Backrest Tradewise', 'Sauder Classic'],
        datasets: [{
            label: 'Profit',
            data: [25, 17, 17, 12, 11],
            backgroundColor: '#ff4d4f',
            borderRadius: 4
        }]
    },
    options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(42, 47, 74, 0.3)'
                },
                ticks: {
                    font: { size: 10 },
                    color: '#b0b0c0'
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    font: { size: 10 },
                    color: '#b0b0c0'
                }
            }
        }
    }
});

// Generate simple world map SVG
function generateWorldMap() {
    const svg = document.getElementById('worldMap');
    
    // Simple circular regions representing continents
    const regions = [
        { cx: 200, cy: 150, r: 60, name: 'North America', color: '#ff7a7a' },
        { cx: 250, cy: 280, r: 40, name: 'South America', color: '#ff4d4f' },
        { cx: 450, cy: 120, r: 50, name: 'Europe', color: '#ff4d4f' },
        { cx: 550, cy: 200, r: 55, name: 'Africa', color: '#ffb3b3' },
        { cx: 700, cy: 150, r: 45, name: 'Asia', color: '#ff4d4f' },
        { cx: 800, cy: 300, r: 35, name: 'Oceania', color: '#ff7a7a' }
    ];

    regions.forEach(region => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', region.cx);
        circle.setAttribute('cy', region.cy);
        circle.setAttribute('r', region.r);
        circle.setAttribute('fill', region.color);
        circle.setAttribute('opacity', '0.7');
        circle.setAttribute('stroke', '#ff4d4f');
        circle.setAttribute('stroke-width', '1');
        svg.appendChild(circle);
    });
}

// Initialize world map
generateWorldMap();

// Year button event listeners
document.querySelectorAll('.year-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// Region filter interaction
document.querySelectorAll('.region-item input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // Update charts based on selected regions
        console.log('Region filter changed');
    });
});
