import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import Icon from '@/components/ui/icon';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Location {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
  country: string;
  admin1?: string;
}

interface WeatherHeaderProps {
  selectedLocation: Location;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Location[];
  isSearching: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  popularCities: { name: string; lat: number; lon: number }[];
  selectLocation: (location: Location) => void;
  getCurrentLocation: () => void;
  geolocating: boolean;
}

export default function WeatherHeader({
  selectedLocation,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  open,
  setOpen,
  popularCities,
  selectLocation,
  getCurrentLocation,
  geolocating
}: WeatherHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon name="CloudSun" size={40} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Волк-синоптик</h1>
          <p className="text-white/80">Точный прогноз погоды и аллергенов</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="flex-1 md:flex-none">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full md:w-[300px] justify-between bg-white/95 dark:bg-white text-[#34495E] hover:bg-white backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={16} />
                  <span className="truncate">{selectedLocation.display_name}</span>
                </div>
                <Icon name="ChevronsUpDown" size={16} className="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput 
                  placeholder="Поиск города..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {isSearching ? 'Поиск...' : 'Город не найден'}
                  </CommandEmpty>
                  
                  {searchQuery.length < 2 && (
                    <CommandGroup heading="Популярные города">
                      {popularCities.map((city) => (
                        <CommandItem
                          key={city.name}
                          value={city.name}
                          onSelect={() => selectLocation({
                            name: city.name,
                            lat: city.lat,
                            lon: city.lon,
                            display_name: city.name,
                            country: 'Россия'
                          })}
                        >
                          <Icon name="MapPin" size={16} className="mr-2" />
                          {city.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Результаты поиска">
                      {searchResults.map((location, index) => (
                        <CommandItem
                          key={index}
                          value={location.display_name}
                          onSelect={() => selectLocation(location)}
                        >
                          <Icon name="MapPin" size={16} className="mr-2" />
                          <div className="flex flex-col">
                            <span>{location.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={getCurrentLocation}
          disabled={geolocating}
          className="bg-white/95 dark:bg-white text-[#34495E] hover:bg-white backdrop-blur-sm"
          title="Моё местоположение"
        >
          <Icon name={geolocating ? "Loader2" : "MapPinned"} size={16} className={geolocating ? "animate-spin" : ""} />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}