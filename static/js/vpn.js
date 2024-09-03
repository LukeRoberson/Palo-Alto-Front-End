/*
    Javascript code related to VPN Tunnels
*/


/*
    Get a list of active devices and create cards for them
*/
fetch('/api/device?action=list')
    .then(response => response.json())
    .then(devices => {
        // Find the div with the id 'div-gp-devices'
        const divVpnMaster = document.getElementById('vpnContainer');
        divVpnMaster.innerHTML = '';

        // Loop through the devices and collect information
        for (const device of devices) {
            // Don't include passive devices
            if (device.ha_state === 'passive') {
                continue;
            }

            // API call
            const url = new URL('/api/vpn?type=ipsec', window.location.origin);
            url.searchParams.append('id', device.device_id);
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(data => {
                    data.forEach(item => {
                        // Create a new card
                        const newCard = document.createElement('div');
                        newCard.classList.add('w3-card');
                        divVpnMaster.appendChild(newCard);

                        // Create a header for the card
                        const header = document.createElement('header');
                        header.classList.add('w3-container');
                        header.innerHTML = `<h3>${item.name}</h3>`;
                        newCard.appendChild(header);

                        // Create a new div element for the contents
                        const newDiv = document.createElement('div');
                        newDiv.classList.add('w3-container');
                        newDiv.classList.add('w3-padding-16');
                        newCard.appendChild(newDiv);

                        // Create a table for information
                        const table = document.createElement('table');
                        table.classList.add('w3-table');
                        newCard.appendChild(table);

                        // Firewall row
                        const nameRow = document.createElement('tr');
                        nameRow.innerHTML = `<td><b>Firewall</b></td><td>${item.firewall}</td>`;
                        table.appendChild(nameRow);

                        // Status row
                        const statusRow = document.createElement('tr');
                        const statusIcon = item.status === 'active'
                            ? '<span style="color: green; font-size: 2em;">&#x1F7E2;</span>' // Green circle
                            : '<span style="color: red; font-size: 2em;">&#x1F534;</span>';  // Red circle
                        statusRow.innerHTML = `<td><b>Status</b></td><td>${item.status}</td>`;
                        header.innerHTML = `${statusIcon} <span style="font-size: 1.5em;">${item.name}</span>`;
                        header.classList.add('w3-padding-16');
                        table.appendChild(statusRow);

                        // Inner interface row
                        const innerIfRow = document.createElement('tr');
                        innerIfRow.innerHTML = `<td><b>Inner Interface</b></td><td>${item.inner_if}</td>`;
                        table.appendChild(innerIfRow);

                        // Outer interface row
                        const outerIfRow = document.createElement('tr');
                        outerIfRow.innerHTML = `<td><b>Outer Interface</b></td><td>${item.outer_if}</td>`;
                        table.appendChild(outerIfRow);

                        // Local IP row
                        const localIpRow = document.createElement('tr');
                        localIpRow.innerHTML = `<td><b>Local IP</b></td><td>${item.local_ip}</td>`;
                        table.appendChild(localIpRow);

                        // Peer IP row
                        const peerIpRow = document.createElement('tr');
                        peerIpRow.innerHTML = `<td><b>Peer IP</b></td><td>${item.peer_ip}</td>`;
                        table.appendChild(peerIpRow);

                        // Spacing
                        newCard.appendChild(document.createElement('br'));
                        divVpnMaster.appendChild(document.createElement('br'));
                        divVpnMaster.appendChild(document.createElement('br'));
                    });
                })
        };
    })
    .catch(error => console.error('Error:', error));
