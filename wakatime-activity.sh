
FILE="dev-notes.md"
COUNTER=1

echo "Starting WakaTime activity generator..."
echo "Updating $FILE every 2 minutes..."
echo "Press Ctrl+C to stop"

while true; do
    # Array of random comments to add
    COMMENTS=(
        "### Update $COUNTER - $(date)"
        "- Reviewing code architecture decisions"
        "- Optimizing database query performance"
        "- Refactoring component structure"
        "- Testing edge cases in user authentication"
        "- Improving error handling mechanisms"
        "- Updating documentation for clarity"
        "- Analyzing user experience flows"
        "- Code review and quality improvements"
        "- Performance profiling and optimization"
        "- Security audit and vulnerability assessment"
        "- Cross-browser compatibility testing"
        "- Mobile responsiveness adjustments"
        "- API endpoint validation"
        "- State management optimization"
        "- Component lifecycle management"
        "- Memory leak prevention"
        "- Bundle size optimization"
        "- Accessibility improvements"
        "- Internationalization considerations"
    )
    
    # Get random comment
    RANDOM_COMMENT=${COMMENTS[$RANDOM % ${#COMMENTS[@]}]}
    
    # Add to file
    echo "" >> $FILE
    echo "$RANDOM_COMMENT" >> $FILE
    
    echo "Added update $COUNTER: $RANDOM_COMMENT"
    
    # Increment counter
    COUNTER=$((COUNTER + 1))
    
    # Wait 2 minutes
    sleep 120
done
