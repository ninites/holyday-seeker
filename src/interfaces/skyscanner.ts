
export interface SkyScannerFlight {
    id:                  string;
    price:               Price;
    legs:                Leg[];
    is_eco_contender:    boolean;
    eco_contender_delta: number;
    score:               number;
    totalDuration:       number;
}

export interface Leg {
    id:          string;
    origin:      Destination;
    destination: Destination;
    departure:   string;
    arrival:     string;
    duration:    number;
    carriers:    Carrier[];
    stop_count:  number;
    stops:       Destination[];
}

export interface Carrier {
    id:                number;
    name:              string;
    alt_id:            string;
    display_code:      string;
    display_code_type: string;
    alliance?:         number;
    brand?:            number;
}

export interface Destination {
    id?:               number;
    entity_id?:        number;
    alt_id?:           string;
    parent_id?:        number;
    parent_entity_id?: number;
    name?:             string;
    type?:             string;
    display_code?:     string;
}

export interface Price {
    amount:        number;
    update_status: string;
    last_updated:  string;
    quote_age:     number;
    score:         number;
    transfer_type: string;
}
