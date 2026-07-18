const modules = import.meta.glob('../assets/preview/wedding-*.jpg', { eager: true, import: 'default' })

const sequence = [
  '041', '003', '029', '014', '075', '001', '022', '055', '010', '019',
  '035', '005', '083', '013', '032', '000', '043', '009', '020', '015',
]

const layouts = [
  'wide', 'portrait', 'medium', 'small', 'portrait',
  'medium', 'wide', 'small', 'portrait', 'medium',
  'small', 'wide', 'portrait', 'medium', 'small',
  'medium', 'portrait', 'wide', 'small', 'medium',
]

const photographs = sequence.map((id, index) => {
  const path = `../assets/preview/wedding-${id}.jpg`
  return { src: modules[path], alt: `Wedding story photograph ${index + 1}`, layout: layouts[index] }
})

function EditorialGallery() {
  return (
    <section className="editorial-gallery" id="selected-work" aria-labelledby="selected-title">
      <header className="gallery-heading">
        <p id="selected-title">Selected work</p>
        <p>Wedding · A&amp;P</p>
      </header>

      <div className="gallery-sequence">
        {photographs.map((photo, index) => (
          <figure className={`gallery-item gallery-item--${photo.layout}`} key={photo.src}>
            <img src={photo.src} alt={photo.alt} loading={index < 4 ? 'eager' : 'lazy'} />
          </figure>
        ))}
      </div>
    </section>
  )
}

export default EditorialGallery
