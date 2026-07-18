import building from '../assets/preview/wedding-000.jpg'
import preparation from '../assets/preview/wedding-001.jpg'
import guests from '../assets/preview/wedding-005.jpg'
import dress from '../assets/preview/wedding-009.jpg'
import arrival from '../assets/preview/wedding-014.jpg'
import ceremony from '../assets/preview/wedding-019.jpg'
import portrait from '../assets/preview/wedding-029.jpg'

const photographs = [
  { src: building, alt: 'Wedding venue surrounded by a garden', layout: 'landscape-small-left' },
  { src: preparation, alt: 'A moment during the wedding preparations', layout: 'portrait-right' },
  { src: guests, alt: 'Guests arriving through the garden', layout: 'landscape-wide' },
  { src: dress, alt: 'The bride preparing her wedding dress', layout: 'landscape-medium-left' },
  { src: arrival, alt: 'Wedding guests walking across the garden', layout: 'landscape-medium-right' },
  { src: ceremony, alt: 'The outdoor wedding ceremony', layout: 'landscape-large' },
  { src: portrait, alt: 'The couple photographed through the foliage', layout: 'landscape-small-right' },
]

function EditorialGallery() {
  return (
    <section className="editorial-gallery" id="selected-work" aria-labelledby="selected-title">
      <header className="gallery-heading">
        <p id="selected-title">Selected work</p>
        <p>Wedding · A&amp;P</p>
      </header>

      <div className="gallery-sequence">
        {photographs.map((photo) => (
          <figure className={`gallery-item ${photo.layout}`} key={photo.src}>
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  )
}

export default EditorialGallery
