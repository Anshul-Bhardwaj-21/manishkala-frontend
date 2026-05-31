import Link from "next/link";

import { Container } from "@/components/Container";
import { getSiteInfo, getAboutPage } from "@/lib/wordpress";
import { getProfileContactLinks } from "@/lib/profile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTwitter, faFacebook, faSquareXTwitter } from "@fortawesome/free-brands-svg-icons";

export async function SiteFooter() {
  const site = await getSiteInfo().catch(() => null);
  const displayName = site?.name || "Manish Kala";

  // 1. Backend se data fetch karne ki koshish karo
  const aboutPage = await getAboutPage().catch(() => null);
  const backendLinks = getProfileContactLinks(aboutPage?.acf) || [];

  // 2. Default/Fallback links define karo jo HAMESHA dikhenge agar backend khali ho
  const defaultLinks = {
    instagram: "https://www.instagram.com/talktokala",
    twitter: "https://x.com",
    facebook: "https://www.facebook.com/manish.kala.562"
  };

  const instagramLink = backendLinks.find(l => l.label.toLowerCase().includes("instagram"))?.href || defaultLinks.instagram;
  const twitterLink = backendLinks.find(l => l.label.toLowerCase().includes("twitter") || l.label.toLowerCase().includes("x"))?.href || defaultLinks.twitter;
  const facebookLink = backendLinks.find(l => l.label.toLowerCase().includes("facebook"))?.href || defaultLinks.facebook;

  return (
    <footer className="mt-24 border-t border-hairline bg-linen/25 py-10">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold text-ink">{displayName}</p>
            {site?.description ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{site.description}</p> : null}
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-5 text-sm font-bold text-muted items-center">
              
              {/* Instagram Icon */}
              <li>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent block w-5 h-5 transition-colors" title="Instagram">
                  <FontAwesomeIcon icon={faInstagram} className="w-full h-full" />
                </a>
              </li>

              {/* Twitter / X Icon */}
              <li>
                <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent block w-5 h-5 transition-colors" title="Twitter / X">
                  <FontAwesomeIcon icon={faSquareXTwitter} className="w-full h-full" />
                </a>
              </li>

              {/* Facebook Icon */}
              <li>
                <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent block w-5 h-5 transition-colors" title="Facebook">
                  <FontAwesomeIcon icon={faFacebook} className="w-full h-full" />
                </a>
              </li>

              {/* Static Page Links */}
              <li className="ml-2 border-l border-hairline pl-4">
                <Link href="/blog" className="hover:text-accent">
                  Writings
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="hover:text-accent">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}