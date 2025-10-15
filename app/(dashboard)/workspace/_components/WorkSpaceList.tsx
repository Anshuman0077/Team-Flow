// Importing UI components from shadcn/ui
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

/*
WHAT THIS COMPONENT DOES:
This is a Workspace List component that displays a sidebar with multiple workspace buttons.
Each workspace is represented by an avatar/icon, and when you hover over them, a tooltip 
shows the full workspace name. Different workspaces get different background colors.
*/

// Array of workspace objects - this is our mock data
const workSpaces = [
    {
        id: 1,
        name: "Team Flow",  // Full workspace name (shown in tooltip)
        avatar: "TF",       // Short abbreviation (shown on button)
    },
    {
        id: 2,
        name: "TailFlow",
        avatar: "TL"
    },
    {
        id: 3,
        name: "Team Flow",
        avatar: "TF",
    },
    {
        id: 4,
        name: "Huxn Dev",
        avatar: "HD"
    },
    {
        id: 5,
        name: "Jan Marshal",
        avatar: "JM",
    },
    {
        id: 6,
        name: "Javascript Mastery",
        avatar: "JM"
    },
]

/*
Color combinations for workspace buttons.
Each string contains Tailwind classes for:
- Default background color
- Hover background color  
- Text color
*/
const colorCombinations = [
    "bg-blue-500 hover:bg-blue-600 text-white",        // Blue theme
    "bg-emerald-500 hover:bg-emerald-600 text-white",  // Green theme
    "bg-purple-500 hover:bg-purple-600 text-white",    // Purple theme
    "bg-rose-500 hover:bg-rose-600 text-white",        // Pink/rose theme
    "bg-indigo-500 hover:bg-indigo-600 text-white",    // Indigo theme
    "bg-cyan-500  hover:bg-cyan-600  text-white",      // Cyan theme
    "bg-pink-500 hover:bg-pink-600 text-white"         // Pink theme
]

/**
 * Function to assign a consistent color to each workspace based on its ID
 * This ensures the same workspace always gets the same color
 * 
 * @param id - The workspace ID (converted to string for processing)
 * @returns string - Tailwind CSS classes for the button colors
 */
const getWorkspaceColor = (id: string) => {
    // Convert ID to string and calculate sum of character codes
    // This creates a "hash" of the ID that we can use to pick a color
    const charSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    // Use modulo operator to ensure we get a valid index within our color array
    const colorIndex = charSum % colorCombinations.length;
    
    // Return the color combination at the calculated index
    return colorCombinations[colorIndex];
}

/**
 * Main Workspace List Component
 * Renders a vertical list of workspace buttons with tooltips
 */
export function WorkSpaceList() {
    return (
        /* 
        TooltipProvider wraps the entire component to enable tooltip functionality
        This is required by Radix UI for tooltips to work properly
        */
        <TooltipProvider>
            {/* 
            Main container - flex column with gap between items
            This creates a vertical stack of workspace buttons
            */}
            <div className="flex flex-col gap-2">
                {/* 
                Map through each workspace and create a button for it
                'ws' is the current workspace object in the iteration
                */}
                {workSpaces.map((ws) => (
                    // {/* 
                    // Tooltip component for showing workspace name on hover
                    // Each tooltip needs a unique key for React rendering
                    // */}
                    <Tooltip key={ws.id}>
                        
                        {/* TooltipTrigger wraps the element that triggers the tooltip
                        'asChild' makes the trigger use the child element (our Button)
                        without adding extra DOM elements */}
                       
                        <TooltipTrigger asChild>
                            
                             {/* Workspace button:
                            - size="icon": Makes it a square button
                            - className: Fixed size with smooth transitions
                            - Currently MISSING the dynamic color classes from getWorkspaceColor */}

                            <Button 
                                size="icon" 
                                // TODO: Add dynamic color classes here
                                className={`size-12 transition-all duration-200 ${getWorkspaceColor(ws.id.toString())}`}
                            >
                                
                                {/* Display the workspace avatar/abbreviation
                                This is the text shown inside the button (like "TF", "TL", etc.) */}
                               
                                <span className="text-sm font-semibold">{ws.avatar}</span>
                            </Button>
                        </TooltipTrigger>

                        
                        {/* // IMPORTANT: The TooltipContent component is MISSING!
                        // Without this, the tooltips won't show any text.
                        // We need to add: */}
                        
                        <TooltipContent side="right">
                            <p>{ws.name}</p>
                        </TooltipContent>
                       
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    )
}