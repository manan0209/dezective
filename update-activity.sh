#!/bin/bash

# WakaTime Activity Generator for both MD and TSX files
# This script periodically updates both files to simulate coding activity

MD_FILE="dev-notes.md"
TSX_FILE="wakatime-activity.tsx"
COUNTER=1

echo "Starting WakaTime activity generator..."
echo "Updating $MD_FILE and $TSX_FILE every 90 seconds..."
echo "Press Ctrl+C to stop"

# Arrays of random updates
MD_COMMENTS=(
    "### Development Session $COUNTER - $(date)"
    "- Analyzing component performance metrics"
    "- Implementing responsive design patterns"
    "- Debugging state synchronization issues"
    "- Optimizing bundle size and load times"
    "- Refactoring legacy code components"
    "- Adding comprehensive error boundaries"
    "- Testing cross-browser compatibility"
    "- Improving accessibility standards"
    "- Code review and quality assurance"
    "- Database query optimization"
    "- API response time improvements"
    "- Security vulnerability assessment"
    "- User experience flow analysis"
    "- Performance profiling session"
    "- Memory leak investigation"
    "- Component lifecycle optimization"
    "- State management refactoring"
    "- TypeScript type safety improvements"
    "- Unit test coverage expansion"
    "- Integration testing scenarios"
)

TSX_COMMENTS=(
    "// Development update $COUNTER - $(date)"
    "// Implementing new component architecture"
    "// Optimizing React render performance"
    "// Adding TypeScript strict mode compliance"
    "// Refactoring custom hooks usage"
    "// Implementing error boundary patterns"
    "// Adding accessibility attributes"
    "// Optimizing component re-renders"
    "// Implementing lazy loading strategies"
    "// Adding comprehensive prop validation"
    "// Improving component composition"
    "// Implementing design system patterns"
    "// Adding responsive breakpoint logic"
    "// Optimizing event handler performance"
    "// Implementing virtual scrolling"
    "// Adding internationalization support"
    "// Improving form validation logic"
    "// Implementing advanced state patterns"
    "// Adding animation performance optimizations"
    "// Improving component testing strategies"
)

TSX_CODE_SNIPPETS=(
    "const newFeature = useMemo(() => computeExpensiveValue(), [dependency]);"
    "const handleClick = useCallback((id: string) => setSelected(id), []);"
    "const [isLoading, setIsLoading] = useState<boolean>(false);"
    "interface NewComponentProps { id: string; title: string; }"
    "export const optimizedComponent = React.memo(Component);"
    "const { data, error, isLoading } = useQuery('key', fetchData);"
    "const theme = useContext(ThemeContext);"
    "const ref = useRef<HTMLDivElement>(null);"
    "useEffect(() => { /* cleanup */ return () => cleanup(); }, []);"
    "const debouncedSearch = useDebounce(searchTerm, 300);"
)
while true; do
    # Update MD file
    MD_COMMENT=${MD_COMMENTS[$RANDOM % ${#MD_COMMENTS[@]}]}
    echo "" >> $MD_FILE
    echo "$MD_COMMENT" >> $MD_FILE
    echo "- Session duration: $((COUNTER * 20)) seconds" >> $MD_FILE
    echo "- Files modified: 2" >> $MD_FILE
    echo "- Code quality: Improving" >> $MD_FILE
    
    # Update TSX file
    TSX_COMMENT=${TSX_COMMENTS[$RANDOM % ${#TSX_COMMENTS[@]}]}
    TSX_SNIPPET=${TSX_CODE_SNIPPETS[$RANDOM % ${#TSX_CODE_SNIPPETS[@]}]}
    
    # Add comment and code snippet to TSX file
    echo "" >> $TSX_FILE
    echo "$TSX_COMMENT" >> $TSX_FILE
    echo "// $TSX_SNIPPET" >> $TSX_FILE
    
    # Sometimes remove a few lines to simulate editing
    if [ $((COUNTER % 3)) -eq 0 ]; then
        # Remove last 2-5 lines from TSX file
        lines_to_remove=$((2 + RANDOM % 4))
        head -n -$lines_to_remove $TSX_FILE > temp_tsx && mv temp_tsx $TSX_FILE
        echo "Removed $lines_to_remove lines from $TSX_FILE (simulating code editing)"
    fi
    
    echo "Update $COUNTER completed:"
    echo "  - Added to $MD_FILE: $MD_COMMENT"
    echo "  - Added to $TSX_FILE: $TSX_COMMENT"
    
    # Increment counter
    COUNTER=$((COUNTER + 1))

    # Wait 30 seconds
    sleep 20
done
