import pageImage from '../../images/page.png';

export default function Home() {
    return (
        <main
            style={{
                padding: 0,
                margin: 0,
                minHeight: '100vh',
                width: '100%',
                backgroundImage: `url(${pageImage.src})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}
        />
    );
}
