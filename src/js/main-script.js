(function (document, window) {

    const resultsEl = document.querySelector('.js-results')
    const modalBackground = document.querySelector('.js-modal-background')
    const modal = document.querySelector('.js-modal')
    const modalForm = document.querySelector('.js-modal-form')
    const modalAdd = document.querySelector('.js-modal-album-add')
    const modalUpdate = document.querySelector('.js-modal-album-update')
    const modalDelete = document.querySelector('.js-modal-album-delete')
    const pagination1 = document.querySelector('.js-pagination-1')
    const pagination2 = document.querySelector('.js-pagination-2')
    const search = document.querySelector('.js-search')

    // Main array to hold all albums
    let albums = [];

    // Use our own ID system so we dont rely on the array index
    let albumsId = 0;

    const fetchData = async (url) => {
        const response = await fetch(url);
        return await response.json();
    }

    const pushAlbumData = (data, id) => {

        // Create new album object
        const albumData = {
            id: id,
            album_title: data.album_title,
            artist: data.artist,
            condition: data.condition,
            year: data.year,
            fav: false
        }

        // Push new album to main array
        albums.push(albumData)
    }

    // Render albums
    const renderAlbums = (data) => {

        const template = document.createElement('div');

        // Add the CSS classes for the album container
        template.classList.add('col-sm-12', 'col-md-6', 'col-lg-4', 'mb-4');

        template.innerHTML =
            `<article class="card h-100 js-album-card" data-id="${data.id}">
                <div class="card-body">
                    <h1 class="h4">${data.album_title}</h1>
                    <h2 class="h5">${data.artist.name}</h2>
                    <p class="card-text">${data.year}</p>
                    <p class="card-text">${data.condition}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-warning js-album-edit">Edit Album</button>
                </div>
            </article>`;

        // Add the album to the results element
        resultsEl.appendChild(template);
    }

    const openModal = () => {

        // Show the modal
        modalBackground.style.display = 'block';
        modal.style.display = 'block';
    }

    const closeModal = () => {

        // Hide the modal
        modalBackground.style.display = 'none';
        modal.style.display = 'none';
    }

    const refreshAlbums = (page) => {
        if (page === 1) {

            // Clear all albums from the doc
            resultsEl.innerHTML = '';

            // Render the albums
            for (let i = 0; i < 25; i++) {
                renderAlbums(albums[i])
            }
        } else if (page === 2) {

            // Clear all albums from the doc
            resultsEl.innerHTML = '';

            // Render the albums
            for (let i = 25; i < albums.length; i++) {
                renderAlbums(albums[i])
            }
        }
    }

    const editDeleteAlbum = (type) => {

        // Get the ID of the album from the modal
        const albumId = modal.getAttribute('data-id')

        // Find the album index within the main array
        const albumPos = albums.map((o) => {return o.id; }).indexOf(parseInt(albumId))

        if (type === 'edit') {

            // Update the album at index
            albums[albumPos] = {
                id: parseInt(albumId),
                album_title: modalForm.elements['albumTitle'].value,
                artist: {
                    name: modalForm.elements['artist'].value,
                    id: albums[albumPos].artist.id
                },
                year: modalForm.elements['year'].value,
                condition: modalForm.elements['condition'].value,
                fav: albums[albumPos].fav
            }

            // Search Artists and return any matching albums IDs
            const matchingArtists = albums.filter( obj => obj.artist.id === albums[albumPos].artist.id )
                .map( obj => obj.id );

            // Loop over those IDs and update the Artist name
            matchingArtists.map((value, i) => {
                albums[value].artist.name = modalForm.elements['artist'].value
            })

        } else if (type === 'delete') {

            // Remove album at index
            albums.splice(albumPos, 1)
        }

        // Check what page we're on and refresh
        if (pagination1.closest('li').classList.contains('active')) {
            refreshAlbums(1);
        } else {
            refreshAlbums(2);
        }

        // Close the modal
        closeModal()
    }

    // Fetch all the data we need
    fetchData('https://gist.githubusercontent.com/seanders/df38a92ffc4e8c56962e51b6e96e188f/raw/b032669142b7b57ede3496dffee5b7c16b8071e1/page1.json')
        .then(data => {

            // TODO use map
            for (let i = 0; i < data.results.length; i++) {
                pushAlbumData(data.results[i], albumsId)
                albumsId++
            }

            fetchData(data.nextPage)
                .then(data => {

                    // TODO use map
                    for (let i = 0; i < data.results.length; i++) {
                        pushAlbumData(data.results[i], albumsId)
                        albumsId++
                    }
                }).then(() => {

                // TODO use map
                // Render the albums now that we have all the data
                for (let i = 0; i < 25; i++) {
                    renderAlbums(albums[i])
                }
            })
        })

    // Click event across the body so we can pick up any new ones
    document.body.addEventListener('click', e => {

        e.preventDefault()

        if (e.target.classList.contains('js-album-edit')) {

            // Get the album ID from the album card
            const albumId = e.target.closest('.js-album-card').getAttribute('data-id');

            // Find the album index within the main array
            const albumPos = albums.map((o) => {return o.id; }).indexOf(parseInt(albumId))

            // Set the buttons for editing an album
            modalDelete.classList.remove('d-none')
            modalUpdate.classList.remove('d-none')
            modalAdd.classList.add('d-none')

            // Add thr album ID to the modal
            modal.setAttribute('data-id', albumId);

            // Open the modal
            openModal()

            // Set the form fields based on the album selected
            modalForm.elements['albumTitle'].value = albums[albumPos].album_title;
            modalForm.elements['artist'].value = albums[albumPos].artist.name;
            modalForm.elements['year'].value = albums[albumPos].year;
            modalForm.elements['condition'].value = albums[albumPos].condition;
            modalForm.elements['albumId'].value = albums[albumPos].id;
        }

        if (e.target.classList.contains('js-modal-close')) {
            closeModal()
        }

        if (e.target.classList.contains('js-pagination-1')) {

            // Refresh on page 2
            refreshAlbums(1);

            // Set the pagination
            pagination2.closest('li').classList.remove('active');
            e.target.closest('li').classList.add('active');
        }

        if (e.target.classList.contains('js-pagination-2')) {

            // Refresh on page 2
            refreshAlbums(2);

            // Set the pagination
            pagination1.closest('li').classList.remove('active');
            e.target.closest('li').classList.add('active');
        }

        if (e.target.classList.contains('js-modal-album-update')) {

            // Edit the album
            editDeleteAlbum('edit')
        }

        if (e.target.classList.contains('js-modal-album-delete')) {

            // Delete the album
            editDeleteAlbum('delete')
        }

        if (e.target.classList.contains('js-add-new-album')) {

            // Display the correct buttons for adding a new album
            modalDelete.classList.add('d-none')
            modalUpdate.classList.add('d-none')
            modalAdd.classList.remove('d-none')

            // Clear the form fields
            modalForm.reset()

            // Open the modal
            openModal()
        }

        if (e.target.classList.contains('js-modal-album-add')) {

            // Find the highest ID in albums
            const highestAlbumId = Math.max.apply(Math, albums.map((o) => { return o.id; }))

            // Find the highest ID in artists
            const highestArtistId = Math.max.apply(Math, albums.map((o) => { return o.artist.id; }))

            // See if there is already an Artist with the same name and map the ID
            const getArtistIndex = albums.map((o) => {return o.artist.name; }).indexOf(modalForm.elements['artist'].value)

            // Create the new Album object
            const newAlbum = {
                id: highestAlbumId + 1,
                album_title: modalForm.elements['albumTitle'].value,
                artist: {
                    name: modalForm.elements['artist'].value,
                    id: getArtistIndex >= 0 ? albums[getArtistIndex].artist.id : highestArtistId + 1
                },
                year: modalForm.elements['year'].value,
                condition: modalForm.elements['condition'].value,
                fav: false
            }

            // Add the new album to the main array
            albums.push(newAlbum);

            // Check what page we're on and refresh
            if (pagination1.closest('li').classList.contains('active')) {
                refreshAlbums(1);
            } else {
                refreshAlbums(2);
            }

            // Close Modal
            closeModal()
        }

    })

    search.addEventListener('keyup', e => {

        // Only start once user has more than 3 letters
        if (e.target.value.length < 3) return

        console.log(e.target.value);

        const matchAlbums = albums.map((o) => {return o.album_title; }).indexOf(e.target.value)
        const matchArtists = albums.map((o) => {return o.artist.name; }).indexOf(e.target.value)

        console.log(matchAlbums)
        console.log(matchArtists)

    })

})(document, window);