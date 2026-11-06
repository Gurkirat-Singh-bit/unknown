import { CategoryGrid, HeroSection, Navbar, SiteFooter, TrendingSection } from "../src";
import { sampleEvents } from "./events";
import { sampleStatistics } from "./statistics";

export function HomeFixture() {
  return <main><Navbar /><HeroSection statistics={sampleStatistics} onSearch={(query) => console.info("Search:", query)} /><TrendingSection events={sampleEvents} /><CategoryGrid /><SiteFooter /></main>;
}
