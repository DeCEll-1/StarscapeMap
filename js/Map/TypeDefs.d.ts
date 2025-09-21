// types.d.ts

export interface Connection {
    startSystem: StarSystem;
    endSystem: StarSystem;
    center: [number, number, number];
    direction: [number, number, number];
    height: number;
}

// Enums
export type Region = 'Altera' | 'Arkana' | 'Beacon' | 'Core' | 'Eternity' | 'Olivava' | 'Sanctum' | 'Terminus' | 'Wildar';
export type Spice = 'None' | 'Red' | 'Green' | 'Blue' | 'Orange' | 'Purple' | 'Yellow' | 'Silver';
export type SpectralClass = 'A' | 'B' | 'F' | 'G' | 'K' | 'M';
export type SystemNames = string; // Represents one of 4500+ system names

export type Sector =
    | 'Altera1' | 'Altera2' | 'Altera3' | 'Altera4' | 'Altera5' | 'Altera6' | 'Altera7' | 'Altera8' | 'Altera9'
    | 'Arkana1' | 'Arkana2' | 'Arkana3' | 'Arkana4' | 'Arkana5' | 'Arkana6' | 'Arkana7'
    | 'Beacon1' | 'Beacon2' | 'Beacon3' | 'Beacon4' | 'Beacon5' | 'Beacon6' | 'Beacon7' | 'Beacon8'
    | 'Catalyst' | 'Contact' | 'Empyrean'
    | 'Eternity1' | 'Eternity2' | 'Eternity3' | 'Eternity4' | 'Eternity5' | 'Eternity6' | 'Eternity7' | 'Eternity8' | 'Eternity9'
    | 'FirstMandate' | 'Harvest' | 'InnerCore'
    | 'Olivava1' | 'Olivava2' | 'Olivava3' | 'Olivava4' | 'Olivava5' | 'Olivava6' | 'Olivava7' | 'Olivava8' | 'Olivava9'
    | 'Passage'
    | 'Sanctum1' | 'Sanctum2' | 'Sanctum3' | 'Sanctum4' | 'Sanctum5' | 'Sanctum6' | 'Sanctum7' | 'Sanctum8'
    | 'Schism' | 'SecondMandate' | 'Sentinel'
    | 'Terminus1' | 'Terminus2' | 'Terminus3' | 'Terminus4' | 'Terminus5' | 'Terminus6' | 'Terminus7' | 'Terminus8' | 'Terminus9'
    | 'Valence'
    | 'Wildar1' | 'Wildar2' | 'Wildar3' | 'Wildar4' | 'Wildar5' | 'Wildar6' | 'Wildar7' | 'Wildar8' | 'Wildar9' | 'Wildar10';

export type Faction = 'Foralkan' | 'Kavani' | 'Lycentian' | 'Neutral' | 'Syndicate' | 'TradeUnion';
export type Security = 'Contested' | 'Core' | 'Secure' | 'Unsecure' | 'Wild';

export interface StarSystem {
    region: Region;
    spice: Spice;
    id: string;
    spectralClass: SpectralClass;
    name: SystemNames;
    links: SystemNames[];
    uncharted: boolean;
    position: number[];
    warfare: number;
    sector: Sector;
    faction: Faction;
    security: Security;
}
