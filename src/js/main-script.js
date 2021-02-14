import Localbase from "localbase";

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
    let albums = [];
    let albumsId = 0;

    const fetchData = async (url) => {
        const response = await fetch(url);
        return await response.json();
    }

    fetchData('https://gist.githubusercontent.com/seanders/df38a92ffc4e8c56962e51b6e96e188f/raw/b032669142b7b57ede3496dffee5b7c16b8071e1/page1.json')
        .then(data => {
            for (let i = 0; i < data.results.length; i++) {
                pushAlbumData(data.results[i], albumsId)
                albumsId++
            }

            fetchData(data.nextPage)
                .then(data => {
                    for (let i = 0; i < data.results.length; i++) {
                        pushAlbumData(data.results[i], albumsId)
                        albumsId++
                    }
                }).then(() => {
                for (let i = 0; i < 25; i++) {
                    renderAlbums(albums[i])
                }
            })
        })

    const pushAlbumData = (data, id) => {
        const albumData = {
            id: id,
            album_title: data.album_title,
            artist: data.artist,
            condition: data.condition,
            year: data.year,
            fav: false
        }
        albums.push(albumData)
    }

    // Render albums
    const renderAlbums = (data) => {

        const template = document.createElement('div');
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
        resultsEl.appendChild(template);
    }

    const openModal = () => {
        modalBackground.style.display = 'block';
        modal.style.display = 'block';
    }

    const closeModal = () => {
        modalBackground.style.display = 'none';
        modal.style.display = 'none';
    }

    const refreshAlbums = (page) => {
        if (page === 1) {
            resultsEl.innerHTML = '';
            for (let i = 0; i < 25; i++) {
                renderAlbums(albums[i])
            }
        } else if (page === 2) {
            resultsEl.innerHTML = '';
            for (let i = 25; i < albums.length; i++) {
                renderAlbums(albums[i])
            }
        }
    }

    const editDeleteAlbum = (type) => {

        // Get the ID of the album from the modal
        const albumId = modal.getAttribute('data-id')

        // Search the albums array and return the index
        const albumPos = albums.map((o) => {return o.id; }).indexOf(parseInt(albumId))

        if (type === 'edit') {

           // Update album at index
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

            // Search Artists and update with new name
            const matchingArtists = albums.filter( obj => obj.artist.id === albums[albumPos].artist.id )
                .map( obj => obj.id );

            // Now loop over those IDs and update the Artist name
            matchingArtists.map((value, i) => {
                albums[value].artist.name = modalForm.elements['artist'].value
            })

        } else if (type === 'delete') {

            // Remove album at index
            albums.splice(albumPos, 1)
        }

        if (pagination1.closest('li').classList.contains('active')) {
            refreshAlbums(1);
        } else {
            refreshAlbums(2);
        }

        closeModal()
    }

    document.body.addEventListener('click', (e) => {

        e.preventDefault()

        if (e.target.classList.contains('js-album-edit')) {

            const albumId = e.target.closest('.js-album-card').getAttribute('data-id');
            const albumPos = albums.map((o) => {return o.id; }).indexOf(parseInt(albumId))

            modalDelete.classList.remove('d-none')
            modalUpdate.classList.remove('d-none')
            modalAdd.classList.add('d-none')
            modal.setAttribute('data-id', albumId);

            openModal()

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
            refreshAlbums(1);
            pagination2.closest('li').classList.remove('active');
            e.target.closest('li').classList.add('active');
        }

        if (e.target.classList.contains('js-pagination-2')) {
            refreshAlbums(2);
            pagination1.closest('li').classList.remove('active');
            e.target.closest('li').classList.add('active');
        }

        if (e.target.classList.contains('js-modal-album-update')) {
            editDeleteAlbum('edit')
        }

        if (e.target.classList.contains('js-modal-album-delete')) {
            editDeleteAlbum('delete')
        }

        if (e.target.classList.contains('js-add-new-album')) {
            modalDelete.classList.add('d-none')
            modalUpdate.classList.add('d-none')
            modalAdd.classList.remove('d-none')
            modalForm.reset()
            openModal()
        }

        if (e.target.classList.contains('js-modal-album-add')) {

            // Find the highest ID in albums
            const highestAlbumId = Math.max.apply(Math, albums.map((o) => { return o.id; }))

            // Find the highest ID in artist
            const highestArtistId = Math.max.apply(Math, albums.map((o) => { return o.artist.id; }))

            // See if there is already an Artist with the same name and map the ID
            const getArtistIndex = albums.map((o) => {return o.artist.name; }).indexOf(modalForm.elements['artist'].value)

            // Create the new Album object
            const newAlbum = {
                id: highestAlbumId + 1,
                album_title: modalForm.elements['albumTitle'].value,
                artist: {
                    name: modalForm.elements['artist'].value,
                    id: getArtistIndex ? albums[getArtistIndex].artist.id : highestArtistId + 1
                },
                year: modalForm.elements['year'].value,
                condition: modalForm.elements['condition'].value,
                fav: false
            }

            albums.push(newAlbum);

            if (pagination1.closest('li').classList.contains('active')) {
                refreshAlbums(1);
            } else {
                refreshAlbums(2);
            }

            closeModal()
        }

    })


    // Search albums

})(document, window);