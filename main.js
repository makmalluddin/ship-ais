// fungsi mengambil data
// fungsi mengambil data
async function fetchData() {
    try {
        const response = await fetch('http://localhost:8080/data');
        const data = await response.json();
        console.log('Data fetched:', data); 
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// fungsi menampilkan data
async function displayData() {
    const data = await fetchData();

    if (!data || data.length === 0) {
        console.error('No data available.');
        return;
    }

    const map = L.map('map').setView([data[0].latitude, data[0].longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Buat kontrol untuk menampilkan jumlah kapal
    const shipCountControl = L.control({ position: 'topright' });

    shipCountControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'ship-count-control');
        div.innerHTML = `Total Kapal: 0`;
        return div;
    };

    shipCountControl.addTo(map);

    const markers = {};
    const colors = new Map();
    const colorPalette = chroma.scale(['red', 'green', 'blue', 'yellow', 'purple', 'orange']).mode('lch').colors(50);
    let colorIndex = 0;

    let index = 0;
    const intervalId = setInterval(() => {
        if (index < data.length) {
            const item = data[index];
            const { mmsi, latitude, longitude, speed, accuracy, course, heading } = item;

            // assign color to mmsi if not already assigned
            if (!colors.has(mmsi)) {
                colors.set(mmsi, colorPalette[colorIndex % colorPalette.length]);
                colorIndex++;
            }

            const color = colors.get(mmsi);

            // update marker dengan hapus sebelum
            if (markers[mmsi]) {
                map.removeLayer(markers[mmsi]);
            }

            // buat marker baru menggunakan ikon kapal
            const boatIcon = new L.boatMarker([latitude, longitude], {
                color: color,
                speed: speed,
                course: course,
                heading: heading
            }).addTo(map);

            boatIcon.bindPopup(`
                <p>MMSI: ${mmsi}</p>
                <p>Speed: ${speed}</p>
                <p>Accuracy: ${accuracy}</p>
                <p>Longitude: ${longitude}</p>
                <p>Latitude: ${latitude}</p>
                <p>Course: ${course}</p>
                <p>Heading: ${heading}</p>
            `);

            boatIcon.setHeading(course);

            // simpan marker baru
            markers[mmsi] = boatIcon;

            // Update total kapal
            const totalShips = Object.keys(markers).length;
            document.querySelector('.ship-count-control').innerHTML = `Total Kapal: ${totalShips}`;

            index++;
        } else {
            clearInterval(intervalId);
        }
    }, 0.1);
}

displayData();

// // fungsi grafik
// const chart = echarts.init(document.getElementById('chart'));
// const option = {
//     title: {
//         text: 'Grafik Contoh',
//         left: 'center',
//     },
//     tooltip: {},
//     xAxis: {
//         data: ['A', 'B', 'C', 'D', 'E', 'F']
//     },
//     yAxis: {},
//     series: [{
//         name: 'Penjualan',
//         type: 'bar',
//         data: [5, 20, 36, 10, 10, 20]
//     }]
// };
// chart.setOption(option);

// // Logika untuk menampilkan dan menyembunyikan grafik
// const chartContainer = document.getElementById('chart');
// const toggleButton = document.getElementById('toggle-chart');

// toggleButton.addEventListener('click', () => {
//     if (chartContainer.classList.contains('hidden')) {
//         chartContainer.classList.remove('hidden');
//         toggleButton.classList.add('hide');
//         document.getElementById('map').style.width = '60%';
//         chart.resize();  // Memperbarui ukuran grafik setelah ditampilkan
//     } else {
//         chartContainer.classList.add('hidden');
//         toggleButton.classList.remove('hide');
//         document.getElementById('map').style.width = '100%';
//     }
//     map.invalidateSize(); // Memperbarui ukuran peta setelah perubahan lebar
// });

// // Pastikan grafik diperbarui ukurannya saat jendela diubah ukurannya
// window.addEventListener('resize', () => {
//     chart.resize();
// });
