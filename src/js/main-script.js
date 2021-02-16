(function (document, window) {

    const resultsEl = document.querySelector('.js-results')
    const modalBackground = document.querySelector('.js-modal-background')
    const modal = document.querySelector('.js-modal')
    const modalForm = document.querySelector('.js-modal-form')
    const modalAdd = document.querySelector('.js-modal-album-add')
    const modalUpdate = document.querySelector('.js-modal-album-update')
    const modalDelete = document.querySelector('.js-modal-album-delete')
    const modalTitle = document.querySelector('.js-modal-title')
    const pagination1 = document.querySelector('.js-pagination-1')
    const pagination2 = document.querySelector('.js-pagination-2')
    const search = document.querySelector('.js-search')
    const filterFavs = document.querySelector('.js-show-fav')

    // Main array to hold all albums
    let albums = [];

    // Use our own ID system so we dont rely on the array index
    let albumsId = 0;

    const fetchData = async url => {
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

    const renderAlbums = data => {

        const template = document.createElement('div');

        let conditionStars = ''

        switch (data.condition) {
            case 'poor':
                conditionStars = '<i class="fa fa-star"></i><i class="fa fa-star"></i>'
                break
            case 'fair':
                conditionStars = '<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i>'
                break
            case 'very_good':
                conditionStars = '<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i>'
                break
            case 'mint':
                conditionStars = `<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i>`
                break
            default:
                conditionStars = '<i class="fa fa-star"></i>'
        }

        // Add the CSS classes for the album container
        template.classList.add('col-sm-12', 'col-md-6', 'col-lg-4', 'mb-4');

        template.innerHTML =
            `<article class="card h-100 js-album-card" data-id="${data.id}">
                <div class="card-body">
                    <h1 class="h5 card-body-title">${data.album_title}</h1>
                    <h2 class="h6 mb-4 card-body-sub">${data.artist.name}</h2>
                    <p class="card-text"><i class="fa fa-calendar"></i> ${data.year}</p>
                    <p class="card-text">Condition: ${conditionStars}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-dark js-album-edit">Edit Album</button>
                    <i class="fa ${data.fav ? 'fa-heart' : 'fa-heart-o'} pull-right mt-2 js-album-fav"></i>
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

    const favsFilter = (type = '') => {

        if (type === 'active') {
            filterFavs.classList.add('active')
            filterFavs.querySelector('i').classList.add('fa-heart')
            filterFavs.querySelector('i').classList.remove('fa-heart-o')
        } else {
            filterFavs.classList.remove('active')
            filterFavs.querySelector('i').classList.add('fa-heart-o')
            filterFavs.querySelector('i').classList.remove('fa-heart')
        }
    }

    const refreshAlbums = () => {

        if (pagination1.closest('li').classList.contains('active')) {

            // Clear all albums from the doc
            resultsEl.innerHTML = '';

            // Render the albums
            for (let i = 0; i < 25; i++) {
                renderAlbums(albums[i])
            }

        } else {

            // Clear all albums from the doc
            resultsEl.innerHTML = '';

            // Render the albums
            for (let i = 25; i < albums.length; i++) {
                renderAlbums(albums[i])
            }

        }

    }

    const editDeleteAlbum = type => {

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

        // Switch off favs filter
        favsFilter()

        // Check what page we're on and refresh
        refreshAlbums()

        // Close the modal
        closeModal()
    }

    // Fetch all the data we need
    fetchData('https://gist.githubusercontent.com/seanders/df38a92ffc4e8c56962e51b6e96e188f/raw/b032669142b7b57ede3496dffee5b7c16b8071e1/page1.json')
        .then(data => {

            const albumsFound = data.results.length

            data.results.map(o => {
                pushAlbumData(o, albumsId)
                albumsId++
            })

            fetchData(data.nextPage)
                .then(data => {

                    data.results.map(o => {
                        pushAlbumData(o, albumsId)
                        albumsId++
                    })

                }).then(() => {

                // Render the albums for page 1
                for (let i = 0; i < albumsFound; i++) {
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

            // Update the modal title
            modalTitle.innerHTML = 'Edit album'

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

            // Switch off favs filter
            favsFilter()

            // Set the pagination
            pagination2.closest('li').classList.remove('active');
            e.target.closest('li').classList.add('active');

            // Refresh the albums
            refreshAlbums();
        }

        if (e.target.classList.contains('js-pagination-2')) {

            // Switch off favs filter
            favsFilter()

            // Set the pagination
            pagination1.closest('li').classList.remove('active');
            e.target.closest('li').classList.add('active');

            // Refresh the albums
            refreshAlbums();
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

            // Update the modal title
            modalTitle.innerHTML = 'Add new album'

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
            refreshAlbums();

            // Close Modal
            closeModal()
        }

        if (e.target.classList.contains('js-album-fav')) {

            // Get the album ID from the album card
            const albumId = e.target.closest('.js-album-card').getAttribute('data-id');

            // Find the album index within the main array
            const albumPos = albums.map((o) => {return o.id; }).indexOf(parseInt(albumId))

            // Set the fav field
            albums[albumPos].fav = e.target.classList.contains('fa-heart-o');

            if (!filterFavs.classList.contains('active')) {

                // Check what page we're on and refresh
                refreshAlbums();

            } else {

                // Remove the card from the page
                return document.querySelector(`[data-id="${albumId}"]`).parentElement.remove()
            }

        }

        if (e.target.classList.contains('js-album-fav-edit')) {

            // Get the album ID from the album card
            const albumId = e.target.closest('.js-modal').getAttribute('data-id');

            // Find the album index within the main array
            const albumPos = albums.map((o) => {return o.id; }).indexOf(parseInt(albumId))

            if (e.target.classList.contains('fa-heart-o')) {

                e.target.classList.remove('fa-heart-o')
                e.target.classList.add('fa-heart')

                // Set the fav field
                albums[albumPos].fav = true;

            } else {

                e.target.classList.remove('fa-heart')
                e.target.classList.add('fa-heart-o')

                // Set the fav field
                albums[albumPos].fav = false;
            }

        }

        if (e.target.classList.contains('js-show-fav')) {

            if (!e.target.classList.contains('active')) {

                // Switch on favs filter
                favsFilter('active')

                // Filter the albums and return the index of found item(s)
                const matchFavs = albums.filter(o => {
                    if (o.fav) {
                        return albums.indexOf(o) > -1
                    }
                });

                // Clear all albums from the doc
                resultsEl.innerHTML = '';

                if (matchFavs.length > 0) {

                    // Render the returned indexes for albums
                    matchFavs.map((o) => {
                        renderAlbums(o)
                    })

                } else {
                    resultsEl.innerHTML = '<div class="col-md-12"><h2>You have no favorites at the moment</h2></div>';
                }

            } else {

                // Switch off favs filter
                favsFilter()
                refreshAlbums()
            }

        }

    })

    // User starts with the search
    search.addEventListener('keyup', e => {

        // Only start once user has more than 2 letters
        if (e.target.value.length < 2) {

            // Switch off favs filter
            favsFilter()

            // Check what page we're on and refresh
            refreshAlbums();

            return
        }

        // Switch off favs filter
        favsFilter()

        // Set a case-insensitive regex
        const regexp = new RegExp(e.target.value, 'i');

        // Filter the albums and return the index of found item(s)
        const matchAlbums = albums.filter(o => {
            if (regexp.test(o.album_title)) {
                return albums.indexOf(o)
            }
            if (regexp.test(o.artist.name)) {
                return albums.indexOf(o)
            }
        });

        // Clear all albums from the doc
        resultsEl.innerHTML = '';

        // Render the returned indexes for albums
        matchAlbums.map((o) => {
            renderAlbums(o)
        })

    })

})(document, window);